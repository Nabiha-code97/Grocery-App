import express from 'express'
import {
    adminLogin, adminLogout, isAdminAuth,
    getSellers, getCustomers,
    getCustomerAnalytics, getBestSellers, getSalesTrends
} from '../controllers/adminController.js'
import authAdmin from '../middlewares/authAdmin.js'

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.get('/logout', authAdmin, adminLogout);
adminRouter.get('/is-auth', authAdmin, isAdminAuth);
adminRouter.get('/sellers', authAdmin, getSellers);
adminRouter.get('/customers', authAdmin, getCustomers);
adminRouter.get('/analytics/customers', authAdmin, getCustomerAnalytics);
adminRouter.get('/analytics/best-sellers', authAdmin, getBestSellers);
adminRouter.get('/analytics/sales-trends', authAdmin, getSalesTrends);

export default adminRouter
