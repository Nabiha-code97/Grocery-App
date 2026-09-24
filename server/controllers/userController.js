import User from '../models/User.js';
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"


//login user
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email or password required' })
        }

        const normalizedEmail = String(email).trim().toLowerCase()

        const accounts = await User.find({ email: normalizedEmail })

        const matches = []
        for (const account of accounts) {
            if (await bcrypt.compare(password, account.passwordHash)) {
                matches.push(account)
            }
        }

        if (matches.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' })
        }

        if (matches.length > 1 && !role) {
            return res.json({
                success: false,
                needsRole: true,
                roles: matches.map(m => m.role),
                message: 'Select which account to sign in to'
            })
        }

        const user = role ? matches.find(m => m.role === role) : matches[0]

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' })
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true, // Prevent JavaScript to access cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // protection CSRF

            maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
        })

        return res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                shopName: user.shopName
            }
        })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message })
    }
}

//check auth /api/user/is-auth

export const isAuth = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).select("-passwordHash");

        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authorized!' });
        }

        return res.json({
            success: true,
            user
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}

//logout
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged Out" })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
}
