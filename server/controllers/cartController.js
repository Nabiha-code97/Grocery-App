import User from '../models/User.js'

// Update Cart --- /api/cart/update  (User)
export const updateCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cartItems } = req.body;

        // cartItems must be present; reject early to avoid writing undefined to DB
        if (!cartItems) {
            return res.json({ success: false, message: 'cartItems required' })
        }

        // Replaces the entire cart in one atomic write instead of merging item-by-item
        await User.findByIdAndUpdate(userId, { cartItem: cartItems })

        return res.json({ success: true, message: 'Cart updated' })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
