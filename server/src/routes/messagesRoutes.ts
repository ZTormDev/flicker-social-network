import express from "express";
import { auth } from "../middleware/auth";
import {
  sendMessage,
  getChatMessages, // Add this import
  markAsRead,
} from "../controllers/messagesController";

const router = express.Router();

router.post("/send", auth, sendMessage);
router.get("/chat/:chatId", auth, getChatMessages); // Add this route
router.put("/read/:messageId", auth, markAsRead);

export default router;
