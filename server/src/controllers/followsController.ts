import { Request, Response } from "express";
import { Follows } from "../models/Follows";
import { User } from "../models/User";
import { sequelize } from "../config/database";

export const getFollowers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const followers = await Follows.findAll({
      where: { following_id: id },
      include: [
        {
          model: User,
          as: "Follower",
          attributes: ["id", "username", "userImage", "isOnline", "lastSeen"],
        },
      ],
    });

    return res.json(followers);
  } catch (error) {
    console.error("Get followers error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const followUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const transaction = await sequelize.transaction();

  try {
    const follower_id = req.user_id;
    const following_id = parseInt(req.body.following_id);

    if (follower_id == following_id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if follow relationship already exists
    const existingFollow = await Follows.findOne({
      where: { follower_id, following_id },
      transaction,
    });

    if (existingFollow) {
      await transaction.rollback();
      return res.status(400).json({ message: "Already following this user" });
    }

    // Create follow relationship
    const follow = await Follows.create(
      {
        follower_id,
        following_id,
      },
      { transaction }
    );

    // Update follower and following counts
    await Promise.all([
      User.increment("following", {
        by: 1,
        where: { id: follower_id },
        transaction,
      }),
      User.increment("followers", {
        by: 1,
        where: { id: following_id },
        transaction,
      }),
    ]);

    await transaction.commit();
    return res.status(201).json(follow);
  } catch (error) {
    await transaction.rollback();
    console.error("Error following user:", error);
    return res.status(500).json({ message: "Error following user" });
  }
};

export const unfollowUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const transaction = await sequelize.transaction();

  try {
    const follower_id = req.user_id;
    const following_id = parseInt(req.params.id);

    const follow = await Follows.findOne({
      where: { follower_id, following_id },
      transaction,
    });

    if (!follow) {
      await transaction.rollback();
      return res.status(404).json({ message: "Follow relationship not found" });
    }

    // Delete follow relationship
    await follow.destroy({ transaction });

    // Update follower and following counts using raw queries
    await sequelize.query(
      "UPDATE users SET following = following - 1 WHERE id = :follower_id",
      {
        replacements: { follower_id },
        transaction,
      }
    );

    await sequelize.query(
      "UPDATE users SET followers = followers - 1 WHERE id = :following_id",
      {
        replacements: { following_id },
        transaction,
      }
    );

    await transaction.commit();
    return res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error("Error unfollowing user:", error);
    return res.status(500).json({ message: "Error unfollowing user" });
  }
};

export const getFollowing = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = parseInt(req.params.id);

    const following = await Follows.findAll({
      where: { follower_id: userId },
    });

    return res.json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    return res.status(500).json({ message: "Error fetching following" });
  }
};

export const syncFollowCounts = async (res: Response): Promise<Response> => {
  const transaction = await sequelize.transaction();

  try {
    const users = await User.findAll({ transaction });

    for (const user of users) {
      const [followers, following] = await Promise.all([
        Follows.count({
          where: { following_id: user.id },
          transaction,
        }),
        Follows.count({
          where: { follower_id: user.id },
          transaction,
        }),
      ]);

      await user.update(
        {
          followers,
          following,
        },
        { transaction }
      );
    }

    await transaction.commit();
    return res.status(200).json({ message: "Follow counts synchronized" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error syncing follow counts:", error);
    return res.status(500).json({ message: "Error syncing follow counts" });
  }
};
