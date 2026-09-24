import mongoose from 'mongoose'

const signUpRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["user", "seller"],
      default: "user"
    },
    shopName: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  { timestamps: true }
)

signUpRequestSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 600 })
signUpRequestSchema.index({ email: 1, role: 1 }, { unique: true })


const SignUpRequest =
  mongoose.models.SignUpRequest ||
  mongoose.model('SignUpRequest', signUpRequestSchema)

export default SignUpRequest
