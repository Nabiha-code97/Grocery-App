import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Order from '../models/Order.js'

// Admin Login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password required' })
        }

        if (email !== process.env.SUPER_ADMIN_EMAIL || password !== process.env.SUPER_ADMIN_PASSWORD) {
            return res.json({ success: false, message: 'Invalid credentials' })
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.json({ success: true, message: 'Admin logged in successfully', token })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Admin Logout
export const adminLogout = async (req, res) => {
    try {
        res.clearCookie('adminToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: 'Admin logged out' })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Check Admin Auth /api/admin/is-auth
export const isAdminAuth = async (req, res) => {
    try {
        return res.json({ success: true, message: 'Admin authenticated' })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get all registered sellers /api/admin/sellers
export const getSellers = async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller' }).select('-passwordHash').sort({ createdAt: -1 });
        return res.json({ success: true, sellers })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get all registered customers /api/admin/customers
export const getCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: 'user' }).select('-passwordHash').sort({ createdAt: -1 });
        return res.json({ success: true, customers })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

const GROUP_ID_BY_RANGE = {
    daily: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, d: { $dayOfMonth: '$createdAt' } },
    weekly: { y: { $year: '$createdAt' }, w: { $isoWeek: '$createdAt' } },
    monthly: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
}

const DAYS_BY_RANGE = { daily: 30, weekly: 90, monthly: 365 }

const groupIdToDate = (id) => {
    if (id.d !== undefined) return `${id.y}-${String(id.m).padStart(2, '0')}-${String(id.d).padStart(2, '0')}`
    if (id.w !== undefined) return `${id.y}-W${String(id.w).padStart(2, '0')}`
    return `${id.y}-${String(id.m).padStart(2, '0')}`
}

// Customer signup trend /api/admin/analytics/customers
export const getCustomerAnalytics = async (req, res) => {
    try {
        const range = ['daily', 'weekly', 'monthly'].includes(req.query.range) ? req.query.range : 'daily'
        const since = new Date(Date.now() - DAYS_BY_RANGE[range] * 24 * 60 * 60 * 1000)

        const rows = await User.aggregate([
            { $match: { role: 'user', createdAt: { $gte: since } } },
            { $group: { _id: GROUP_ID_BY_RANGE[range], count: { $sum: 1 } } },
            { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.w': 1 } },
        ])

        const data = rows.map(r => ({ date: groupIdToDate(r._id), count: r.count }))

        return res.json({ success: true, data })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

const PAID_ORDER_FILTER = { $or: [{ paymentType: 'COD' }, { isPaid: true }] }

// Best selling products /api/admin/analytics/best-sellers
export const getBestSellers = async (req, res) => {
    try {
        const rows = await Order.aggregate([
            { $match: PAID_ORDER_FILTER },
            { $unwind: '$items' },
            { $group: {
                _id: '$items.product',
                totalQuantity: { $sum: '$items.quantity' },
                orderCount: { $sum: 1 },
            }},
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            { $addFields: { productObjId: { $toObjectId: '$_id' } } },
            { $lookup: {
                from: 'products',
                localField: 'productObjId',
                foreignField: '_id',
                as: 'productInfo',
            }},
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            { $project: {
                _id: 0,
                productId: '$_id',
                totalQuantity: 1,
                orderCount: 1,
                name: '$productInfo.name',
                image: { $arrayElemAt: ['$productInfo.image', 0] },
                price: '$productInfo.price',
                offerPrice: '$productInfo.offerPrice',
                sellerId: '$productInfo.sellerId',
            }},
        ])

        return res.json({ success: true, products: rows })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Sales / revenue trend /api/admin/analytics/sales-trends
export const getSalesTrends = async (req, res) => {
    try {
        const range = ['daily', 'weekly', 'monthly'].includes(req.query.range) ? req.query.range : 'daily'
        const since = new Date(Date.now() - DAYS_BY_RANGE[range] * 24 * 60 * 60 * 1000)

        const rows = await Order.aggregate([
            { $match: { ...PAID_ORDER_FILTER, createdAt: { $gte: since } } },
            { $group: {
                _id: GROUP_ID_BY_RANGE[range],
                revenue: { $sum: '$amount' },
                orderCount: { $sum: 1 },
            }},
            { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.w': 1 } },
        ])

        const data = rows.map(r => ({ date: groupIdToDate(r._id), revenue: r.revenue, orderCount: r.orderCount }))

        return res.json({ success: true, data })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
