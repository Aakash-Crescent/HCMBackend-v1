import express from "express";
import connectDB from "./config/db";

const app = express();

// Middleware
app.use(express.json);

//Connect DB
connectDB();

// Test Route
app.get("/", (req, res) => {
    res.send("Backend Server is Running");
});

export default app;