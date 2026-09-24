import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    cartItem: { type: Object, default: {} },

    role: {
        type: String,
        enum: ["user", "seller", "admin"],
        default: "user",
        required: true,
        index: true
    },

    shopName: {
        type: String,
        trim: true,
        required: function () { return this.role === 'seller' }
    },
    phone: {
        type: String,
        trim: true,
        required: function () { return this.role === 'seller' }
    }
}, { timestamps: true, minimize: false });

userSchema.index({ email: 1, role: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User
