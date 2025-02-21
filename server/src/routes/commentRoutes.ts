import { Router } from "express";
import { auth } from "../middleware/auth";
import {
  createComment,
  getPostComments,
  deleteComment,
} from "../controllers/commentController";

const router = Router();

router.post("/", auth, createComment);
router.get("/post/:post_id", auth, getPostComments);
router.delete("/:id", auth, deleteComment);

export default router;
