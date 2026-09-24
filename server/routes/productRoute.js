import express from 'express'
import { addProduct, productList, productById, sellerProducts, changeStock, deleteProduct } from '../controllers/productController.js'
import authUser, { isSeller } from '../middlewares/authUser.js'
import { upload } from '../configs/multer.js'

const productRouter = express.Router();

productRouter.post('/add', authUser, isSeller, upload.array('images', 4), addProduct);
productRouter.get('/list', productList);
productRouter.get('/seller', authUser, isSeller, sellerProducts);
productRouter.post('/stock', authUser, isSeller, changeStock);
productRouter.post('/delete', authUser, isSeller, deleteProduct);
productRouter.get('/:id', productById);

export default productRouter
