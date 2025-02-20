import { Request, Response } from "express";
import { User } from "../models/User";

export const getProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = await User.findByPk(req.user_id, {
      attributes: { exclude: ["passwordHash"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = await User.findByPk(req.user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { username, email, userImage } = req.body; // Add userImage
    await user.update({ username, email, userImage }); // Add userImage

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        userImage: user.userImage, // Add userImage
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["passwordHash", "email"] }, // Add userImage
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserByUsername = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: {
        exclude: ["passwordHash", "email"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Get user by username error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = await User.findByPk(req.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { isOnline } = req.body;
    await user.update({
      isOnline,
      lastSeen: new Date(),
    });

    return res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
