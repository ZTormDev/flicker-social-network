import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { User } from '../models/User';

export const createPost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { content } = req.body;
    const userId = req.userId;

    if (userId === undefined) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.create({
      content,
      userId,
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ message: 'Error creating post' });
  }
};

export const getPosts = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const posts = await Post.findAll({
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ message: 'Error fetching posts' });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (userId === undefined) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.findOne({
      where: { id, userId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.update({ content });
    return res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ message: 'Error updating post' });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

     if (userId === undefined) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.findOne({
      where: { id, userId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.destroy();
    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Error deleting post' });
  }
};