import { Request, Response } from "express";
import Contract from "../models/Contract";
import ActivityLog from "../models/ActivityLog";

export const createContract = async (req: Request, res: Response) => {
  try {
    const contract = new Contract(req.body);
    await contract.save();

    // Log activity
    const log = new ActivityLog({
      contractId: contract._id,
      type: "created",
      title: "Contract Created",
      description: `Contract "${contract.title}" was created.`,
      user: req.body.createdBy, // assuming frontend passes user id
      timestamp: new Date(),
    });
    await log.save();

    res.status(201).json(contract);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getContracts = async (req: Request, res: Response) => {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getContractById = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    res.json(contract);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateContract = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!contract) return res.status(404).json({ error: "Contract not found" });

    // Log activity
    const log = new ActivityLog({
      contractId: contract._id,
      type: "edited",
      title: "Contract Updated",
      description: `Contract "${contract.title}" was updated.`,
      user: req.body.updatedBy, // frontend should pass user id
      timestamp: new Date(),
    });
    await log.save();

    res.json(contract);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteContract = async (req: Request, res: Response) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) return res.status(404).json({ error: "Contract not found" });

    // Log activity
    const log = new ActivityLog({
      contractId: contract._id,
      type: "terminated",
      title: "Contract Deleted",
      description: `Contract "${contract.title}" was deleted.`,
      user: req.body.userId, // who deleted it
      timestamp: new Date(),
    });
    await log.save();

    res.json({ message: "Contract deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
