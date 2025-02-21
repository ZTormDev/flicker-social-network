import { Request, Response } from "express";
import { Comment } from "../models/Comment";
import { User } from "../models/User";

export const createComment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { content, post_id } = req.body;
    const user_id = req.user_id;

    if (!content || !post_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const comment = await Comment.create({
      content,
      user_id,
      post_id,
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "userImage"],
        },
      ],
    });

    return res.status(201).json(commentWithUser);
  } catch (error) {
    console.error("Create comment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPostComments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { post_id } = req.params;

    const comments = await Comment.findAll({
      where: { post_id },
      include: [
        {
          model: User,
          attributes: ["id", "username", "userImage"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteComment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const user_id = req.user_id;

    const comment = await Comment.findOne({
      where: { id, user_id },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await comment.destroy();
    return res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
