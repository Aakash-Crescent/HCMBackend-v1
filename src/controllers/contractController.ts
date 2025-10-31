import { Request, Response } from "express";
import Contract from "../models/Contract";
import ActivityLog from "../models/ActivityLog";

// CHECK FOR DUPLICATE TENDER
export const checkTenderId = async (req: Request, res: Response) => {
  try {
    const { tenderId } = req.params;
    const { excludeId } = req.query; // optional

    if (!tenderId || !tenderId.trim()) {
      return res.status(400).json({ error: "tenderId is required" });
    }

    // escape regex to avoid special char issues
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^${escapeRegex(tenderId.trim())}$`, "i"); // exact, case-insensitive

    const query: any = { tenderId: regex };
    if (excludeId) {
      query._id = { $ne: excludeId as string };
    }

    const existing = await Contract.findOne(query)
      .select("_id tenderId")
      .lean();

    return res.status(200).json({ exists: !!existing });
  } catch (err) {
    console.error("checkTenderId error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// CREATE CONTRACT
export const createContract = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const contractData = req.body;
    contractData.originalEndDate = contractData.endDate;

    // 🧠 Determine initial status based on start/end dates
    const today = new Date();
    const startDate = new Date(contractData.startDate);
    const endDate = new Date(contractData.endDate);

    let initialStatus: "active" | "upcoming" | "expired" = "upcoming";

    if (startDate <= today && endDate >= today) {
      initialStatus = "active"; // 👉 Current date is between start and end
    } else if (endDate < today) {
      initialStatus = "expired"; // 👉 End date has already passed
    } else if (today < startDate) {
      initialStatus = "upcoming"; // 👉 Start date is in the future
    }

    contractData.status = initialStatus;
    contractData.createdAt = new Date();
    contractData.updatedAt = new Date();

    const contract = new Contract(contractData);
    await contract.save();

    // Log activity
    const log = new ActivityLog({
      tenderId: contract._id,
      type: "created",
      title: "Tender Created",
      description: `Tender - "${contract.tenderTitle}" was created.`,
      user: {
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
      },
      timestamp: new Date(),
    });
    await log.save();

    res.status(201).json(contract);
  } catch (err: any) {
    console.log(err.message);
    // 🧠 Check for MongoDB duplicate key error
    if (err.code === 11000 && err.keyPattern?.tenderId) {
      return res.status(400).json({
        error:
          "A contract with this Tender ID already exists. Please use a unique Tender ID.",
      });
    }

    res.status(400).json({ error: err.message });
  }
};

// GET ALL CONTRACTS
export const getContracts = async (req: Request, res: Response) => {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET CONTRACT COUNTS
export const getContractCounts = async (req: Request, res: Response) => {
  try {
    const totalContracts = await Contract.countDocuments();
    const draftContracts = await Contract.countDocuments({ status: "draft" });
    const terminatedContracts = await Contract.countDocuments({
      status: "terminated",
    });
    const activeContracts = await Contract.countDocuments({ status: "active" });
    const upcomingContracts = await Contract.countDocuments({
      status: "upcoming",
    });
    const expiredContracts = await Contract.countDocuments({
      status: "expired",
    });

    res.json({
      total: totalContracts,
      draft: draftContracts,
      terminated: terminatedContracts,
      active: activeContracts,
      upcoming: upcomingContracts,
      expired: expiredContracts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET RECENT CONTRACTS
export const getRecentContracts = async (req: Request, res: Response) => {
  try {
    const recentContracts = await Contract.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();
    res.json(recentContracts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET CONTRACT BY ID
export const getContractById = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    res.json(contract);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE CONTRACT
export const updateContract = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Fetch the existing contract first
    const existingContract = await Contract.findById(req.params.id);
    if (!existingContract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Perform the update
    const updatedContract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    let action = "edited"; // default

    // ✅ 1. Check if status changed
    if (req.body.status && req.body.status !== existingContract.status) {
      switch (req.body.status) {
        case "active":
          action = "extended";
          break;
        case "terminated":
          action = "terminated";
          break;
        case "expired":
          action = "fulfilled";
          break;
      }
    }
    // ✅ 2. If status didn't change, but endDate increased → extended
    else if (
      req.body.endDate &&
      new Date(req.body.endDate) > new Date(existingContract.endDate)
    ) {
      action = "extended";
    }

    // ✅ 3. Otherwise → edited (default)

    // Log the activity
    const log = new ActivityLog({
      tenderId: updatedContract!._id,
      type: action,
      title: `Tender ${action}`,
      description: `Tender "${updatedContract!.tenderTitle}" was ${action}.`,
      user: {
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      timestamp: new Date(),
    });

    await log.save();

    res.json(updatedContract);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE CONTRACT
export const deleteContract = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) return res.status(404).json({ error: "Contract not found" });

    // Log activity
    const log = new ActivityLog({
      tenderId: contract._id,
      type: "deleted",
      title: "Tender Deleted",
      description: `Tender "${contract.tenderTitle}" was deleted.`,
      user: {
        name: req.user!.name,
        email: req.user!.email,
        role: req.user!.role,
      },
      timestamp: new Date(),
    });
    await log.save();

    res.json({ message: "Contract deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
