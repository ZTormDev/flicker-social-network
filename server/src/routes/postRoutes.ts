import { Router } from "express";
import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  getUserPosts,
} from "../controllers/postController";
import { auth } from "../middleware/auth";
import { compressVideoPreview } from "../controllers/postController";
const router = Router();

router.get("/", auth, getPosts);
router.post("/", auth, createPost);
router.post("/compress-video", auth, compressVideoPreview);
router.put("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
router.get("/user/:userId", auth, getUserPosts);

export default router;
