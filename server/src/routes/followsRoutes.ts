import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  followUser,
  getFollowers,
  unfollowUser,
  syncFollowCounts,
  getFollowing,
} from "../controllers/followsController";

const router = Router();

router.get("/:id", auth, getFollowers);
router.post("/", auth, followUser);
router.delete("/:id", auth, unfollowUser);
router.post("/sync", auth, syncFollowCounts); // Add this route to manually sync counts if needed
router.get("/following/:id", auth, getFollowing);

export default router;
