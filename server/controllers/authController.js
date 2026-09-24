// controllers/authController.js

import SignUpRequest from "../models/SignUpRequest.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import SibApiV3Sdk from "sib-api-v3-sdk";
import jwt from "jsonwebtoken"

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const SIGNUP_ROLES = ["user", "seller"]
const MIN_PASSWORD_LENGTH = 8
const MAX_OTP_ATTEMPTS = 5

export const sendOTPEmail = async (email, otp) => {
  const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

  await tranEmailApi.sendTransacEmail({
    sender: { email: process.env.BREVO_SENDER_EMAIL, name: "GreenCart OTP" },
    to: [{ email }],
    subject: "OTP Code",
    htmlContent: `<h2>Your OTP is ${otp}</h2>`,
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const issueToken = (res, user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return token
}

export const sendOTPController = async (req, res) => {
  try {
    const { name, email, password, role = 'user', shopName, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    if (!SIGNUP_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" })
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      })
    }

    if (role === 'seller' && (!shopName?.trim() || !phone?.trim())) {
      return res.status(400).json({
        success: false,
        message: "Shop name and phone are required for sellers"
      })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    const existingUser = await User.findOne({ email: normalizedEmail, role })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `A ${role} account already exists for this email`
      })
    }

    const existingRequest = await SignUpRequest.findOne({ email: normalizedEmail, role })

    if (
      existingRequest &&
      Date.now() - existingRequest.updatedAt.getTime() < 30 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait 30 seconds before requesting another OTP"
      })
    }

    const otp = generateOTP()

    const passwordHash = await bcrypt.hash(password, 10)
    const otpHash = await bcrypt.hash(otp, 10)

    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)

    const sellerFields = role === 'seller'
      ? { shopName: shopName.trim(), phone: phone.trim() }
      : { shopName: undefined, phone: undefined }

    if (existingRequest) {
      existingRequest.name = name
      existingRequest.passwordHash = passwordHash
      existingRequest.otpHash = otpHash
      existingRequest.otpExpiresAt = otpExpiresAt
      existingRequest.attempts = 0
      existingRequest.role = role
      existingRequest.shopName = sellerFields.shopName
      existingRequest.phone = sellerFields.phone

      await existingRequest.save()
    } else {
      await SignUpRequest.create({
        name,
        email: normalizedEmail,
        passwordHash,
        otpHash,
        otpExpiresAt,
        role,
        ...sellerFields
      })
    }

    await sendOTPEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    })

  } catch (error) {
    console.log(error)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, role = 'user' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    const request = await SignUpRequest.findOne({ email: normalizedEmail, role });

    if (!request) {
      return res.status(404).json({ success: false, message: "No request found!" });
    }

    if (request.otpExpiresAt < Date.now()) {
      await SignUpRequest.deleteOne({ _id: request._id });
      return res.status(400).json({ success: false, message: "OTP Expired!" });
    }

    const isMatch = await bcrypt.compare(otp, request.otpHash);

    if (!isMatch) {
      request.attempts += 1;

      if (request.attempts >= MAX_OTP_ATTEMPTS) {
        await SignUpRequest.deleteOne({ _id: request._id });
        return res.status(429).json({
          success: false,
          message: "Too many incorrect attempts. Please sign up again."
        });
      }

      await request.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    let user;
    try {
      user = await User.create({
        name: request.name,
        email: request.email,
        passwordHash: request.passwordHash,
        role: request.role,
        ...(request.role === 'seller' && { shopName: request.shopName, phone: request.phone })
      })
    } catch (createError) {
      if (createError.code === 11000) {
        await SignUpRequest.deleteOne({ _id: request._id });
        return res.status(409).json({ success: false, message: "Account already exists" });
      }
      throw createError
    }

    const token = issueToken(res, user)

    await SignUpRequest.deleteOne({ _id: request._id });

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        shopName: user.shopName
      }
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message })
  }
}
