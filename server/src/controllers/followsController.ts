import { Request, Response } from "express";
import { Follows } from "../models/Follows";
import { User } from "../models/User";

export const getFollowers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = parseInt(req.params.id);

    const followers = await Follows.findAll({
      where: { following_id: userId },
      include: [
        {
          model: User,
          attributes: ["id", "username", "userImage"],
          as: "Follower",
        },
      ],
    });

    return res.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    return res.status(500).json({ message: "Error fetching followers" });
  }
};

export const followUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const follower_id = req.user_id;
    const following_id = parseInt(req.body.following_id);

    if (follower_id === following_id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if follow relationship already exists
    const existingFollow = await Follows.findOne({
      where: { follower_id, following_id },
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user" });
    }

    const follow = await Follows.create({
      follower_id,
      following_id,
    });

    return res.status(201).json(follow);
  } catch (error) {
    console.error("Error following user:", error);
    return res.status(500).json({ message: "Error following user" });
  }
};

export const unfollowUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const follower_id = req.user_id;
    const following_id = parseInt(req.params.id);

    const follow = await Follows.findOne({
      where: { follower_id, following_id },
    });

    if (!follow) {
      return res.status(404).json({ message: "Follow relationship not found" });
    }

    await follow.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return res.status(500).json({ message: "Error unfollowing user" });
  }
};
