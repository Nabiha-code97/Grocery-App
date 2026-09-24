import express from 'express';
import { updateCart } from '../controllers/cartController.js'
import authUser, { isUser } from '../middlewares/authUser.js'

const cartRouter = express.Router();

cartRouter.post('/update', authUser, isUser, updateCart);

export default cartRouter;