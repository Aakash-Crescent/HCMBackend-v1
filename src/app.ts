import express from "express";
import connectDB from "./config/db";
import cors from "cors";
import contractRoutes from "./routes/contractRoutes";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import { authMiddleware } from "./middleware/authMiddleware";
import activityRoutes from "./routes/activityRoutes"

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//Connect DB
connectDB();

//Private Routes
app.use("/api/contracts", authMiddleware, contractRoutes);
app.use("/api/activity", authMiddleware, activityRoutes);

// Public Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Server is Running");
});

export default app;
