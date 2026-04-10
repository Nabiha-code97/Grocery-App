import express from "express";
import mongoose, { connect } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectdb from "./configs/db.js";
import "dotenv/config"
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import addressRouter from "./routes/addressRoute.js";
import connectCloudinay from "./configs/cloudinary.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

await connectdb();
await connectCloudinay();

//Allowing multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://grocery-app-lyart-xi.vercel.app/',
  process.env.FRONTEND_URL,
].filter(Boolean)

// middlewares
app.use(cors({origin: allowedOrigins, credentials: true}));
app.use(express.json());
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/address', addressRouter)

// DB connect
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
