import { Request, Response } from "express";
import { Message } from "../models/Messages";
import { User } from "../models/User";
import { Op } from "sequelize";
import { Chat } from "../models/Chats";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { content, chatId } = req.body;
    const senderId = req.user_id;

    if (!content || !chatId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const message = await Message.create({
      content,
      senderId,
      chatId,
      read: false,
    });

    await chat.update({ lastMessageAt: new Date() });

    const messageWithUser = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "userImage"],
        },
      ],
    });

    return res.status(201).json(messageWithUser);
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: "Error sending message" });
  }
};

// Mark message as read
export const markAsRead = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { messageId } = req.params;
    const userId = req.user_id;

    const message = await Message.findOne({
      where: {
        id: messageId,
        receiverId: userId,
      },
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await message.update({ read: true });
    return res.json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({ message: "Error marking message as read" });
  }
};

export const getChatMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { chatId } = req.params;
    const userId = req.user_id;

    // Verify user has access to this chat
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!chat) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.findAll({
      where: {
        chatId: chatId,
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "userImage"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Mark unread messages as read
    await Message.update(
      { read: true },
      {
        where: {
          chatId: chatId,
          senderId: { [Op.ne]: userId },
          read: false,
        },
      }
    );

    return res.json(messages);
  } catch (error) {
    console.error("Get chat messages error:", error);
    return res.status(500).json({ message: "Error retrieving messages" });
  }
};
