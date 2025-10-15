import express from "express";
import connectDB from "./config/db";
import cors from "cors";
import contractRoutes from "./routes/contractRoutes";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";

const app = express();

// Middleware
app.use(cors())
app.use(express.json());
app.use(cookieParser());

//Connect DB
connectDB();

//Routes
app.use("/api/contracts", contractRoutes);
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("Backend Server is Running");
});

export default app;