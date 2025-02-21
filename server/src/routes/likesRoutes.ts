import { Router } from "express";
import { auth } from "../middleware/auth";
import { likePost, unlikePost, getLikes } from "../controllers/likesController";

const router = Router();

router.post("/", auth, likePost);
router.delete("/:id", auth, unlikePost);
router.get("/:post_id", auth, getLikes);

export default router;
