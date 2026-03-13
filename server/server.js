import express from "express";
import mongoose, { connect } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectdb from "./configs/db.js";
import "dotenv/config"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

await connectdb();

//Allowing multiple origins
const allowedOrigins = ['http://localhost:5173']

// middlewares
app.use(cors({origin: allowedOrigins, credentials: true}));
app.use(express.json());
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// DB connect
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
