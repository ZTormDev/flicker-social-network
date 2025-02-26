import { Request, Response } from "express";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { Op } from "sequelize";
import multer from "multer";
import path from "path";
import { compressVideo } from "../utils/videoCompressor";
import fs from "fs/promises";
import Likes from "../models/Likes";

// Add interface for the Post with User included
interface PostWithUser extends Post {
  User?: {
    username: string;
    userImage: string;
  };
}

// Add this helper function at the top of the file after the imports
const getUniqueFilename = async (originalPath: string): Promise<string> => {
  let counter = 1;
  let uniquePath = originalPath;

  while (true) {
    try {
      await fs.access(uniquePath);
      // File exists, try next number
      const ext = path.extname(originalPath);
      const nameWithoutExt = originalPath.slice(0, -ext.length);
      uniquePath = `${nameWithoutExt}(${counter})${ext}`;
      counter++;
    } catch {
      // File doesn't exist, we can use this name
      return uniquePath;
    }
  }
};

// Modify the storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: async (_req, file, cb) => {
    const date = new Date();
    const formatedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}_${date
      .getHours()
      .toString()
      .padStart(2, "0")}.${date.getMinutes().toString().padStart(2, "0")}.${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    const uniqueSuffix = `${formatedDate}-flicker`;
    const originalFilename = `${uniqueSuffix}-${file.fieldname}${path.extname(
      file.originalname
    )}`;

    try {
      const uniquePath = await getUniqueFilename(originalFilename);
      cb(null, path.basename(uniquePath));
    } catch (error) {
      cb(error as Error, originalFilename);
    }
  },
});

const upload = multer({ storage });

export const getPosts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
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
    });

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const postJson = post.toJSON() as PostWithUser;
        const likesCount = await Likes.count({ where: { post_id: post.id } });

        // Check if user is authenticated before checking if they liked the post
        let userLiked = false;
        if (req.user_id) {
          const likeExists = await Likes.findOne({
            where: { post_id: post.id, user_id: req.user_id },
          });
          userLiked = !!likeExists;
        }

        return {
          id: postJson.id,
          content: postJson.content,
          user_id: postJson.user_id,
          created_at: postJson.created_at,
          expires_at: postJson.expires_at,
          media: postJson.media ? postJson.media.split(",") : [],
          likes: likesCount,
          userLiked: userLiked,
          user: {
            username: postJson.User?.username || "Unknown User",
            userimage: postJson.User?.userImage || "",
          },
        };
      })
    );

    return res.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Error fetching posts" });
  }
};

export const createPost = [
  (req: Request, res: Response, next: Function) => {
    upload.array("media", 20)(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ message: "Error uploading files" });
      }
      return next();
    });
  },
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { content } = req.body;
      const user_id = req.user_id;
      const files = req.files as Express.Multer.File[];

      if (!user_id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Process each file
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            if (file.mimetype.startsWith("video/")) {
              // Compress video and get new path
              const compressedPath = await compressVideo(file.path);
              // Delete original file
              await fs.unlink(file.path);
              return compressedPath;
            }
            return file.path;
          } catch (error) {
            console.error("Error processing file:", error);
            // Delete the failed file
            await fs.unlink(file.path).catch(console.error);
            throw error;
          }
        })
      );

      const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const post = await Post.create({
        content,
        user_id,
        expires_at,
        media: processedFiles.length > 0 ? processedFiles.join(",") : undefined,
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

export const getUserPosts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const posts = await Post.findAll({
      where: {
        user_id: userId,
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
    });

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const postJson = post.toJSON() as PostWithUser;
        const likesCount = await Likes.count({ where: { post_id: post.id } });

        // Check if user is authenticated before checking if they liked the post
        let userLiked = false;
        if (req.user_id) {
          const likeExists = await Likes.findOne({
            where: { post_id: post.id, user_id: req.user_id },
          });
          userLiked = !!likeExists;
        }

        return {
          id: postJson.id,
          content: postJson.content,
          user_id: postJson.user_id,
          created_at: postJson.created_at,
          expires_at: postJson.expires_at,
          media: postJson.media ? postJson.media.split(",") : [],
          likes: likesCount,
          userLiked: userLiked,
          user: {
            username: postJson.User?.username || "Unknown User",
            userimage: postJson.User?.userImage || "",
          },
        };
      })
    );

    return res.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res.status(500).json({ message: "Error fetching user posts" });
  }
};
