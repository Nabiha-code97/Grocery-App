import Product from '../models/Product.js'
import { v2 as cloudinary } from 'cloudinary'

// Add Product --- /api/product/add  (Seller)
export const addProduct = async (req, res) => {
    try {
        const { name, description, price, offerPrice, category, subCategory } = req.body;

        const files = req.files;

        if (!name || !description || !price || !category || !files || files.length === 0) {
            return res.json({ success: false, message: 'Missing product details' })
        }

        // upload each image to cloudinary
        const imagesURL = await Promise.all(
            files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' })
                return result.secure_url;
            })
        )

        const product = await Product.create({
            name, description, price, offerPrice, category, subCategory,
            image: imagesURL
        })

        return res.json({ success: true, message: 'Product added', product })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get All Products --- /api/product/list  (Public)
export const productList = async (req, res) => {
    try {
        const products = await Product.find({})
        return res.json({ success: true, products })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Get Single Product --- /api/product/:id  (Public)
export const productById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id)

        if (!product) {
            return res.json({ success: false, message: 'Product not found' })
        }

        return res.json({ success: true, product })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// Change inStock --- /api/product/stock  (Seller)
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body;

        if (!id || inStock === undefined) {
            return res.json({ success: false, message: 'id and inStock required' })
        }

        const product = await Product.findByIdAndUpdate(id, { inStock }, { new: true })

        if (!product) {
            return res.json({ success: false, message: 'Product not found' })
        }

        return res.json({ success: true, message: 'Stock updated', product })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}
