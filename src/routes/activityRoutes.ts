import express from "express";
import {
  getActivityLogsByTender,
  getRecentActivityLogs,
} from "../controllers/activityController";

const router = express.Router();

// GET top 5 recent activity logs
router.get("/recent", getRecentActivityLogs);

// GET all logs for a specific tender
router.get("/:tenderId", getActivityLogsByTender);

export default router;
