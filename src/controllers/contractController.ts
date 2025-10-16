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
    console.log("Logged in User: ", req.user);
    
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = req.user;
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
      title: "Contract Created",
      description: `Contract for hospital "${contract.tenderTitle}" was created.`,
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
export const updateContract = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contract) return res.status(404).json({ error: "Contract not found" });

    let action = "";

    if (req.body.status === "active") {
      action = "extended";
    } else if (req.body.status === "terminated") {
      action = req.body.status;
    } else if (req.body.status === "expired") {
      action = "fulfilled";
    }

    // Log activity
    const log = new ActivityLog({
      tenderId: contract._id,
      type: action,
      title: "Contract Updated",
      description: `Contract for hospital "${contract.tenderTitle}" was updated.`,
      user: req.body.user || "system",
      timestamp: new Date(),
    });
    await log.save();

    res.json(contract);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE CONTRACT
export const deleteContract = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) return res.status(404).json({ error: "Contract not found" });

    // Log activity
    const log = new ActivityLog({
      tenderId: contract._id,
      type: "deleted",
      title: "Contract Deleted",
      description: `Contract for hospital "${contract.tenderTitle}" was deleted.`,
      user: req.body.user || "system",
      timestamp: new Date(),
    });
    await log.save();

    res.json({ message: "Contract deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
