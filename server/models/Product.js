
import mongoose from 'mongoose'

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    inStock: { type: Boolean, default: true },
}, { timestamps: true })

const Product = mongoose.models.product || mongoose.model('product', productSchema);
export default Product
