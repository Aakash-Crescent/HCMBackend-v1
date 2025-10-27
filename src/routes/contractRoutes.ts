import { Router } from "express";
import {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
  checkTenderId,
  getRecentContracts
} from "../controllers/contractController";

const router = Router();

router.post("/", createContract);
router.get("/", getContracts);
router.get("/recent", getRecentContracts);
router.get("/:id", getContractById);
router.put("/:id", updateContract);
router.delete("/:id", deleteContract);
router.get("/check-tender/:tenderId", checkTenderId);

export default router;
