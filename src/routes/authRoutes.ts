import { Router } from "express";
import { loginUser, logoutUser } from "../controllers/authController";

const router = Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
