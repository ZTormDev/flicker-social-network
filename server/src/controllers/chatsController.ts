import { Request, Response } from "express";
import { Chat } from "../models/Chats";
import { Message } from "../models/Messages";
import { User } from "../models/User";
import { Op } from "sequelize";

export const getOrCreateChat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const currentUserId = req.user_id;
    const { otherUserId } = req.params;

    let chat = await Chat.findOne({
      where: {
        [Op.or]: [
          { user1Id: currentUserId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: currentUserId },
        ],
      },
    });

    if (!chat) {
      chat = await Chat.create({
        user1Id: Math.min(currentUserId, Number(otherUserId)),
        user2Id: Math.max(currentUserId, Number(otherUserId)),
      });
    }

    return res.json(chat);
  } catch (error) {
    console.error("Get/Create chat error:", error);
    return res.status(500).json({ message: "Error processing chat" });
  }
};

export const getUserChats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user_id;

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["id", "username", "userImage", "isOnline", "lastSeen"],
        },
        {
          model: User,
          as: "user2",
          attributes: ["id", "username", "userImage", "isOnline", "lastSeen"],
        },
        {
          model: Message,
          as: "messages",
          limit: 1,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "username"],
            },
          ],
        },
      ],
      order: [["lastMessageAt", "DESC"]],
    });

    const formattedChats = chats.map((chat) => {
      const chatData = chat.toJSON();
      const otherUser =
        chatData.user1.id === userId ? chatData.user2 : chatData.user1;
      const lastMessage = chatData.messages[0];

      return {
        id: chatData.id,
        otherUser,
        lastMessage,
        unreadCount: 0, // You can add this feature later
      };
    });

    return res.json(formattedChats);
  } catch (error) {
    console.error("Get user chats error:", error);
    return res.status(500).json({ message: "Error retrieving chats" });
  }
};
