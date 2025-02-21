import { Request, Response } from "express";
import { Like } from "../models/Likes";

export const likePost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { post_id } = req.body;
    const user_id = req.user_id;

    // Check if like already exists
    const existingLike = await Like.findOne({
      where: { user_id, post_id },
    });

    if (existingLike) {
      return res.status(400).json({ message: "Post already liked" });
    }

    // Create like
    const like = await Like.create({
      user_id,
      post_id,
    });

    return res.status(201).json(like);
  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({ message: "Error liking post" });
  }
};

export const unlikePost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const user_id = req.user_id;

    const like = await Like.findOne({
      where: { post_id: id, user_id },
    });

    if (!like) {
      return res.status(404).json({ message: "Like not found" });
    }

    await like.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error unliking post:", error);
    return res.status(500).json({ message: "Error unliking post" });
  }
};

export const getLikes = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { post_id } = req.params;

    // Validate post_id
    if (!post_id || isNaN(Number(post_id))) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // Get total likes count for the post
    const likes = await Like.count({
      where: { post_id },
    });

    // Check if the current user has liked the post
    const userLiked = await Like.findOne({
      where: {
        post_id,
        user_id: req.user_id,
      },
    });

    // Return both the total count and whether the user liked the post
    return res.json({
      count: likes,
      userLiked: !!userLiked,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting likes:", error);
    return res.status(500).json({
      message: "Error getting likes",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
