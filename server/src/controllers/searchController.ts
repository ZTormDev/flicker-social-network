import { Request, Response } from "express";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Op } from "sequelize";

// Add interfaces for type safety
interface PostWithUser extends Post {
  User?: {
    username: string;
    userImage: string;
  };
}

export const searchUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { q } = req.query;
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
        ],
      },
      attributes: ["id", "username", "userImage"],
      limit: 20,
    });

    return res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ message: "Error searching users" });
  }
};

export const searchPosts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { q } = req.query;
    const posts = (await Post.findAll({
      where: {
        content: { [Op.iLike]: `%${q}%` },
      },
      include: [
        {
          model: User,
          attributes: ["username", "userImage"],
          as: "User",
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 20,
    })) as PostWithUser[];

    // Formatea los resultados para mantener consistencia
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      created_at: post.created_at,
      user: {
        username: post.User?.username || "Unknown User",
        userImage: post.User?.userImage || "",
      },
    }));

    return res.json(formattedPosts);
  } catch (error) {
    console.error("Error searching posts:", error);
    return res.status(500).json({ message: "Error searching posts" });
  }
};
