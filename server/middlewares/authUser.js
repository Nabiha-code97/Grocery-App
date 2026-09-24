import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    const token = req.cookies?.token || req.headers['user-token'];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized!' })
    }
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

        if (!tokenDecode?.id || !tokenDecode?.role) {
            return res.status(401).json({ success: false, message: 'Not authorized!' })
        }

        req.user = { userId: tokenDecode.id, role: tokenDecode.role };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized!' })
    }
}

const requireRole = (...roles) => (req, res, next) => {
    if (roles.includes(req.user?.role)) {
        return next();
    }
    return res.status(403).json({ success: false, message: `Access restricted to: ${roles.join(', ')}` })
}

export const isUser = requireRole('user')
export const isSeller = requireRole('seller')
export const isAdmin = requireRole('admin')

export default authUser
