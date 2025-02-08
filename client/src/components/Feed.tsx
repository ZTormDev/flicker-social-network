import React, { useState, useEffect } from "react";
import CreatePost from "./CreatePost";
import Post from "./Post";
import "../styles/feed.css";

// filepath: client/src/components/Feed.tsx
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
}

const findUser = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${id}`, {
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

const Feed: React.FC = () => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Verify that data is an array
      if (!Array.isArray(data)) {
        throw new Error("Server response is not an array");
      }

      const postsWithUserData = await addUserDataToPosts(data);
      setPosts(postsWithUserData);
      setError(null);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleNewPost = async (content: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newPost = await response.json();
      const postWithUserData = await addUserDataToPosts([newPost]);
      setPosts((prevPosts) => [postWithUserData[0], ...prevPosts]);
      setError(null);
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="feed">
      <CreatePost onSubmit={handleNewPost} />
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : (
        <div className="posts-container">
          {posts.length === 0 ? (
            <div className="no-posts">No posts yet</div>
          ) : (
            posts.map((post) => <Post key={post.id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
