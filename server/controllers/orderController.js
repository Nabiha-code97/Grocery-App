import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res)=>{
    try {
        const userId = req.user.userId;
        const { items, address } = req.body;
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }
        // Calculate Amount Using Items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD",
        });

        return res.json({success: true, message: "Order Placed Successfully!"})
    }catch(error){
        return res.json({ success: false, messgae: error.message});
    }
}
// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res)=>{
    try {
        const userId = req.user.userId;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
// Get All Orders ( for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res)=>{
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { items, address } = req.body;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        const { origin } = req.headers;

        // Calculate amount and build line items for Stripe
        let amount = 0;
        const lineItems = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.product);
                amount += product.offerPrice * item.quantity;
                return {
                    price_data: {
                        currency: "usd",
                        product_data: { name: product.name },
                        unit_amount: Math.floor(product.offerPrice * 100), // Stripe uses cents
                    },
                    quantity: item.quantity,
                };
            })
        );

        // Add 2% tax as a separate line item
        const taxAmount = Math.floor(amount * 0.02);
        lineItems.push({
            price_data: {
                currency: "usd",
                product_data: { name: "Tax (2%)" },
                unit_amount: taxAmount * 100,
            },
            quantity: 1,
        });

        amount += taxAmount;

        // Create order in DB with isPaid: false first
        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
        });

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders&orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cart`,
            metadata: { orderId: order._id.toString() },
        });

        return res.json({ success: true, url: session.url });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Verify Stripe Payment : /api/order/stripe/verify
export const verifyStripe = async (req, res) => {
    try {
        const { orderId, session_id } = req.body;

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            await Order.findByIdAndUpdate(orderId, { isPaid: true });
            return res.json({ success: true, message: "Payment verified" });
        } else {
            await Order.findByIdAndDelete(orderId);
            return res.json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Update Order Status (for seller) : /api/order/status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.json({ success: false, message: "orderId and status required" });
        }
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }
        res.json({ success: true, message: "Order status updated", order });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}