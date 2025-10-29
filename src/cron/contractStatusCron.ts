// src/cron/contractStatusCron.ts
import cron from "node-cron";
import mongoose from "mongoose";
import Contract from "../models/Contract";
import ActivityLog from "../models/ActivityLog";

const CRON_SCHEDULE = process.env.CONTRACT_STATUS_CRON_SCHEDULE || "5 0 * * *"; // default: daily at 00:05
const CRON_ENABLED = process.env.CONTRACT_STATUS_CRON_ENABLED === "true";
const CRON_TIMEZONE = process.env.CONTRACT_STATUS_CRON_TZ || "UTC";

/**
 * Helper: create activity logs in bulk for a list of contracts
 */
async function createLogsForContracts(contractDocs: any[], type: string, descriptionPrefix = "") {
  if (!contractDocs || contractDocs.length === 0) return;

  const logs = contractDocs.map((c: any) => ({
    tenderId: c._id,
    type,
    title:
      type === "expired"
        ? "Contract Expired"
        : type === "activated"
        ? "Contract Activated"
        : type === "upcoming-activated"
        ? "Contract Activated"
        : "Status Updated",
    description: `${descriptionPrefix}${c.tenderTitle || c.tenderId || c._id}`,
    user: {
      name: "system",
      email: "system@system",
      role: "system",
      department: "software development"
    },
    timestamp: new Date(),
  }));

  try {
    await ActivityLog.insertMany(logs);
  } catch (err) {
    console.error("Failed to insert activity logs for status changes:", err);
  }
}

if (CRON_ENABLED) {
  cron.schedule(
    CRON_SCHEDULE,
    async () => {
      console.log(`[cron] Contract status updater starting at ${new Date().toISOString()}`);

      const now = new Date("2026-01-01T00:00:00.000Z");

      try {
        // 1) Upcoming -> Active (startDate <= now)
        const upcomingToActivate = await Contract.find({
          status: "upcoming",
          startDate: { $lte: now },
        }).lean();

        if (upcomingToActivate.length > 0) {
          const ids = upcomingToActivate.map((c) => c._id);
          await Contract.updateMany({ _id: { $in: ids } }, { $set: { status: "active", updatedAt: new Date() } });
          await createLogsForContracts(upcomingToActivate, "activated", "Start date reached for: ");
          console.log(`[cron] Activated ${ids.length} contract(s)`);
        }

        // 2) Active -> Expired (endDate < now)
        const activeToExpire = await Contract.find({
          status: "active",
          endDate: { $lt: now },
        }).lean();

        if (activeToExpire.length > 0) {
          const ids = activeToExpire.map((c) => c._id);
          await Contract.updateMany({ _id: { $in: ids } }, { $set: { status: "expired", updatedAt: new Date() } });
          await createLogsForContracts(activeToExpire, "expired", "End date passed for: ");
          console.log(`[cron] Expired ${ids.length} contract(s)`);
        }

        console.log(`[cron] Contract status updater finished at ${new Date().toISOString()}`);
      } catch (err) {
        console.error("[cron] Error while updating contract statuses:", err);
      }
    },
    {
      scheduled: true,
      timezone: CRON_TIMEZONE,
    } as unknown as any
  );

  console.log(`[cron] Contract status job scheduled (${CRON_SCHEDULE}) TZ=${CRON_TIMEZONE}`);
} else {
  console.log("[cron] Contract status cron is disabled (set CONTRACT_STATUS_CRON_ENABLED=true to enable)");
}

export default null;
