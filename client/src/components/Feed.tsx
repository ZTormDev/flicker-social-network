import React, { useState, useEffect, useRef, useCallback } from "react";
import CreatePost from "./CreatePost";
import Post from "./Post";
import "../styles/feed.css";

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
    const response = await fetch(
      `https://xq1jpm39-5000.brs.devtunnels.ms/api/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchPosts = async (pageNumber: number) => {
    try {
      const response = await fetch(
        `https://xq1jpm39-5000.brs.devtunnels.ms/api/posts?page=${pageNumber}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Server response is not an array");
      }

      const postsWithUserData = await addUserDataToPosts(data);

      setPosts((prevPosts) =>
        pageNumber === 1
          ? postsWithUserData
          : [...prevPosts, ...postsWithUserData]
      );
      setHasMore(postsWithUserData.length > 0);
      setError(null);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPosts(page);
  }, [page]);

  const handleNewPost = async (content: string, media?: File[]) => {
    try {
      const formData = new FormData();
      formData.append("content", content);

      if (media) {
        media.forEach((file) => {
          formData.append("media", file);
        });
      }

      const response = await fetch(
        "https://xq1jpm39-5000.brs.devtunnels.ms/api/posts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

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
        {posts.length === 0 && !loading ? (
          <div className="no-posts">No posts yet</div>
        ) : (
          posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <div ref={lastPostElementRef} key={post.id}>
                  <Post post={post} onDelete={handleDeletePost} />
                </div>
              );
            } else {
              return (
                <Post key={post.id} post={post} onDelete={handleDeletePost} />
              );
            }
          })
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
