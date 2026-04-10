import User from '../models/User.js'

// Update Cart --- /api/cart/update  (User)
export const updateCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cartItems } = req.body;

        if (!cartItems) {
            return res.json({ success: false, message: 'cartItems required' })
        }

        await User.findByIdAndUpdate(userId, { cartItem: cartItems })

        return res.json({ success: true, message: 'Cart updated' })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
