import express from 'express'
import { addProduct, productList, productById, changeStock } from '../controllers/productController.js'
import authSeller from '../middlewares/authSeller.js'
import { upload } from '../configs/multer.js'

const productRouter = express.Router();

productRouter.post('/add', authSeller, upload.array('images', 4), addProduct);
productRouter.get('/list', productList);
productRouter.post('/stock', authSeller, changeStock);
productRouter.get('/:id', productById);

export default productRouter
