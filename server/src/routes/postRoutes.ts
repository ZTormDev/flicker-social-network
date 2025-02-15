// filepath: server/src/routes/postRoutes.ts
import { Router } from "express";
import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
} from "../controllers/postController";
import { auth } from "../middleware/auth";
import { compressVideoPreview } from "../controllers/postController";
const router = Router();

router.post("/", auth, createPost);
router.post("/compress-video", auth, compressVideoPreview);
router.get("/", getPosts);
router.put("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);

export default router;
