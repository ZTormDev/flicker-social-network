import React, { useState, useEffect } from "react";
import CreatePost from "./CreatePost";
import Post from "./Post";
import "../styles/feed.scss";

interface PostType {
  id: number;
  content: string;
  user_id: number;
  user?: {
    username: string;
    userimage: string;
  };
  created_at: string;
  expires_at: string;
  media?: string[];
}

const findUser = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/id/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) {
      console.error(`Error fetching user ${id}: ${response.status}`);
      return { username: "Unknown User", userimage: "" };
    }
    const user = await response.json();
    return { username: user.username, userimage: user.userImage };
  } catch (error) {
    console.error("Error fetching username:", error);
    return { username: "Unknown User", userimage: "" };
  }
};

const addUserDataToPosts = async (posts: PostType[]) => {
  return Promise.all(
    posts.map(async (post) => {
      const userData = await findUser(post.user_id);
      return {
        ...post,
        user: {
          username: userData.username,
          userimage: userData.userimage,
        },
      };
    })
  );
};

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number; // Add these fields
  following: number; // Add these fields
}

interface FeedProps {
  profile: UserProfile;
  onFollowUpdate: (isFollowing: boolean) => void;
}

const Feed: React.FC<FeedProps> = ({ profile, onFollowUpdate }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const intervalId = setInterval(fetchPosts, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, []);

  const handleNewPost = async (content: string, media?: File[]) => {
    try {
      const formData = new FormData();
      formData.append("content", content);

      if (media) {
        media.forEach((file) => {
          formData.append("media", file);
        });
      }

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newPost = await response.json();
      const postWithUserData = await addUserDataToPosts([newPost]);
      setPosts((prevPosts) => [postWithUserData[0], ...prevPosts]);
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleDeletePost = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  return (
    <div className="feed">
      <CreatePost onSubmit={handleNewPost} />
      {error && <div className="error-message">{error}</div>}
      <div className="posts-container">
        {posts.length == 0 && !loading ? (
          <div className="no-posts">No posts yet</div>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              profile={profile}
              onDelete={handleDeletePost}
              onFollowUpdate={onFollowUpdate}
            />
          ))
        )}
        {loading ? (
          <div className="loading">Loading more posts...</div>
        ) : (
          <div className="loading">
            You reached <b>THE END</b> 🎉
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
