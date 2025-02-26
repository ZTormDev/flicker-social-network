import express from "express";
import { auth } from "../middleware/auth";
import { getOrCreateChat, getUserChats } from "../controllers/chatsController";

const router = express.Router();

router.get("/user", auth, getUserChats);
router.get("/with/:otherUserId", auth, getOrCreateChat);

export default router;
