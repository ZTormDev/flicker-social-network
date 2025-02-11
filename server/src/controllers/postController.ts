import { Request, Response } from "express";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { Op } from "sequelize";
import multer from "multer";
import path from "path";

// Add interface for the Post with User included
interface PostWithUser extends Post {
  User?: {
    username: string;
    userImage: string;
  };
}

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

export const getPosts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = (page - 1) * limit;

    const now = new Date();
    const posts = await Post.findAll({
      where: {
        expires_at: {
          [Op.gt]: now,
        },
      },
      include: [
        {
          model: User,
          attributes: ["username", "userImage"],
          as: "User",
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const formattedPosts = posts.map((post) => {
      const postJson = post.toJSON() as PostWithUser;
      return {
        id: postJson.id,
        content: postJson.content,
        user_id: postJson.user_id,
        created_at: postJson.created_at,
        expires_at: postJson.expires_at,
        media: postJson.media ? postJson.media.split(",") : [],
        user: {
          username: postJson.User?.username || "Unknown User",
          userimage: postJson.User?.userImage || "",
        },
      };
    });

    return res.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Error fetching posts" });
  }
};

export const createPost = [
  upload.array("media", 5), // Limit to 5 files
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { content } = req.body;
      const user_id = req.user_id;

      if (!user_id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      //const expires_at = new Date(Date.now() + 80 * 1000); // 24 hours from now

      // Handle media files
      const mediaFiles = (req.files as Express.Multer.File[]) || [];
      const mediaPaths = mediaFiles.map((file) => file.path);

      const post = await Post.create({
        content,
        user_id,
        expires_at,
        media: mediaPaths.length > 0 ? mediaPaths.join(",") : undefined,
      });

      const createdPost = await Post.findOne({
        where: { id: post.id },
        include: [
          {
            model: User,
            attributes: ["username", "userImage"],
            as: "User",
          },
        ],
      });

      if (!createdPost) {
        return res.status(500).json({ message: "Error fetching created post" });
      }

      const postJson = createdPost.toJSON() as PostWithUser;
      const formattedPost = {
        id: postJson.id,
        content: postJson.content,
        user_id: postJson.user_id,
        created_at: postJson.created_at,
        expires_at: postJson.expires_at,
        media: postJson.media ? postJson.media.split(",") : [],
        user: {
          username: postJson.User?.username || "Unknown User",
          userimage: postJson.User?.userImage || "",
        },
      };

      return res.status(201).json(formattedPost);
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ message: "Error creating post" });
    }
  },
];

export const updatePost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user_id;

    const post = await Post.findOne({
      where: {
        id,
        user_id,
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    await post.update({ content });

    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          attributes: ["username", "userImage"],
        },
      ],
    });

    return res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ message: "Error updating post" });
  }
};

export const deletePost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const user_id = req.user_id;

    const post = await Post.findOne({
      where: {
        id,
        user_id,
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    await post.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ message: "Error deleting post" });
  }
};
