// filepath: server/src/controllers/postController.ts
import { Request, Response } from "express";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { Op } from "sequelize";

export const createPost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { content } = req.body;
    const user_id = req.user_id;

    if (user_id === undefined) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const created_at = new Date(Date.now());
    const updated_at = new Date(Date.now());

    const post = await Post.create({
      content,
      user_id,
      expires_at,
      created_at,
      updated_at,
    });

    // Change the query to use an alias for the User model
    const createdPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: User,
          attributes: ["username", "userImage"],
          as: "User", // Add this line to specify the alias
        },
      ],
      raw: true,
      nest: true,
    });

    if (!createdPost) {
      return res.status(500).json({ message: "Error fetching created post" });
    }

    // Add type assertion to handle the User property
    const formattedPost = {
      id: createdPost.id,
      content: createdPost.content,
      user_id: createdPost.user_id,
      created_at: createdPost.created_at,
      updated_at: createdPost.updated_at,
      expires_at: createdPost.expires_at,
      user: {
        username: (createdPost as any).User.username,
        userimage: (createdPost as any).User.userImage,
      },
    };

    return res.status(201).json(formattedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Error creating post" });
  }
};

// Update getPosts function as well
export const getPosts = async (
  _req: Request,
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
          as: "User", // Add this line to specify the alias
        },
      ],
      order: [["created_at", "DESC"]],
      raw: true,
      nest: true,
    });

    // Use type assertion for the posts array
    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      content: post.content,
      user_id: post.user_id,
      created_at: post.created_at,
      updated_at: post.updated_at,
      expires_at: post.expires_at,
      user: {
        username: post.User.username,
        userimage: post.User.userImage,
      },
    }));

    return res.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Error fetching posts" });
  }
};

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
