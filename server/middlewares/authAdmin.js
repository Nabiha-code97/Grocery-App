import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
    const adminToken = req.cookies?.adminToken || req.headers['admin-token'];

    if (!adminToken) {
        return res.status(401).json({ success: false, message: 'Not Authorized' });
    }
    try {
        const tokenDecode = jwt.verify(adminToken, process.env.JWT_SECRET)

        if (tokenDecode?.email && tokenDecode.email === process.env.SUPER_ADMIN_EMAIL) {
            return next();
        }

        return res.status(403).json({ success: false, message: 'Not authorized!' })
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized!' })
    }
}
export default authAdmin;
