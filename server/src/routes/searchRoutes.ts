import { Router } from "express";
import { auth } from "../middleware/auth";
import { searchPosts, searchUsers } from "../controllers/searchController";

const router = Router();

router.get("/users", auth, searchUsers);
router.get("/posts", auth, searchPosts);

export default router;
