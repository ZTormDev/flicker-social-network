import { Router } from "express";
import {
  getProfile,
  getUserByUsername,
  updateProfile,
  updateStatus,
} from "../controllers/userController";
import { auth } from "../middleware/auth";
import { getUserById } from "../controllers/userController";

const router = Router();

// Specific routes first
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/status", auth, updateStatus);

// Dynamic routes last
router.get("/username/:username", auth, getUserByUsername);
router.get("/id/:id", auth, getUserById);

export default router;
