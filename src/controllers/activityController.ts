import { Request, Response } from "express";
import ActivityLog from "../models/ActivityLog";

// 📌 1️⃣ Get all logs for a specific Tender
export const getActivityLogsByTender = async (req: Request, res: Response) => {
  try {
    const { tenderId } = req.params;

    const logs = await ActivityLog.find({ tenderId })
      .sort({ timestamp: -1 }) // newest first
      .lean();

    return res.status(200).json(logs);
  } catch (err) {
    console.error("getActivityLogsByTender error:", err);
    return res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};

// 📌 2️⃣ Get Top 5 Recent Logs (irrespective of tender)
export const getRecentActivityLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    return res.status(200).json(logs);
  } catch (err) {
    console.error("getRecentActivityLogs error:", err);
    return res.status(500).json({ error: "Failed to fetch recent activity logs" });
  }
};
