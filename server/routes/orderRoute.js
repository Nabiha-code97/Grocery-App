import express from 'express';
import authUser, { isUser, isSeller } from '../middlewares/authUser.js';
import { getSellerOrders, getUserOrders, placeOrderCOD, placeOrderStripe, verifyStripe, updateOrderStatus } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, isUser, placeOrderCOD)
orderRouter.get('/user', authUser, isUser, getUserOrders)
orderRouter.get('/seller', authUser, isSeller, getSellerOrders)
orderRouter.post('/status', authUser, isSeller, updateOrderStatus)
orderRouter.post('/stripe', authUser, isUser, placeOrderStripe)
orderRouter.post('/stripe/verify', authUser, isUser, verifyStripe)

export default orderRouter
