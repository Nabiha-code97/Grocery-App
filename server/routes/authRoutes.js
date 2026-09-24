// routes/authRoutes.js

import express from "express"
import { sendOTPController, verifyOTP } from "../controllers/authController.js"
import { signupLimiter, otpLimiter } from "../middlewares/rateLimit.js"


const authRouter = express.Router()

authRouter.post("/signup", signupLimiter, sendOTPController)
authRouter.post("/verify-otp", otpLimiter, verifyOTP)


export default authRouter
