import express from "express";
import connectDB from "./config/db";
import cors from "cors";
import contractRoutes from "./routes/contractRoutes";

const app = express();

// Middleware
app.use(cors())
app.use(express.json());

//Connect DB
connectDB();

//Routes
app.use("/api/contracts", contractRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("Backend Server is Running");
});

export default app;