import express from 'express';
import authUser, { isUser } from '../middlewares/authUser.js';
import { addAddress, getAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post('/add', authUser, isUser, addAddress)
addressRouter.get('/get', authUser, isUser, getAddress)

export default addressRouter
