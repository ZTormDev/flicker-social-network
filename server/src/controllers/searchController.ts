import { Request, Response } from "express";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Model, Op } from "sequelize";

// Define the interface for the Post attributes
interface PostAttributes {
  id: number;
  content: string;
  user_id: number;
  created_at: Date;
  expires_at: Date;
  media: string | null;
}

// Define the interface for Post with User association
interface PostWithUser extends Model<PostAttributes>, PostAttributes {
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
      attributes: ["id", "username", "userImage", "followers", "following"], // Add followers and following
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

    // First, find users matching the search query
    const matchingUsers = await User.findAll({
      where: {
        username: { [Op.iLike]: `%${q}%` },
      },
      attributes: ["id"],
    });

    const userIds = matchingUsers.map((user) => user.id);

    const posts = (await Post.findAll({
      where: {
        [Op.or]: [
          { content: { [Op.iLike]: `%${q}%` } }, // Search in post content
          { user_id: { [Op.in]: userIds } }, // Search posts by matching users
        ],
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
    })) as unknown as PostWithUser[];

    // Format posts to match the expected structure
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      user_id: post.user_id,
      created_at: post.created_at,
      expires_at: post.expires_at,
      media: post.media ? post.media.split(",") : [],
      user: {
        username: post.User?.username || "Unknown User",
        userimage: post.User?.userImage || "",
      },
    }));

    return res.json(formattedPosts);
  } catch (error) {
    console.error("Error searching posts:", error);
    return res.status(500).json({ message: "Error searching posts" });
  }
};
