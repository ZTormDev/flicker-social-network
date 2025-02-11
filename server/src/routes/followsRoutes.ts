import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  followUser,
  getFollowers,
  unfollowUser,
} from "../controllers/followsController";

const router = Router();

router.get("/:id", auth, getFollowers); // Get followers for a user
router.post("/", auth, followUser); // Follow a user
router.delete("/:id", auth, unfollowUser); // Unfollow a user

export default router;
