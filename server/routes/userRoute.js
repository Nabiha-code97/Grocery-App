import express from 'express'
import { isAuth, login, logout } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js';
import { loginLimiter } from '../middlewares/rateLimit.js';

const userRouter = express.Router();
userRouter.post('/login', loginLimiter, login);
userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout', authUser, logout);

export default userRouter
