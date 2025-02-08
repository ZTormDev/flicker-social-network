import React, { useState, useEffect } from "react";
import "../styles/post.css";

interface PostProps {
  post: {
    id: number;
    content: string;
    user_id: number;
    user?: {
      username: string;
      userimage: string;
    };
    created_at: string;
    expires_at: string; // Add expires_at property
  };
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [post.expires_at]);

  function getTimeLeft() {
    const now = new Date().getTime();
    const expireTime = new Date(post.expires_at).getTime();
    const distance = expireTime - now;

    if (distance < 0) {
      return "Expired";
    }

    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      return date.toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Date unavailable";
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <img
          src={post.user?.userimage}
          alt={post.user?.username || "Default User"}
          className="avatar"
        />
        <div className="post-info">
          <h3>{post.user?.username || "Unknown User"}</h3>
          <span className="timestamp">{formatDate(post.created_at)}</span>
        </div>
      </div>
      <div className="post-content">{post.content}</div>
      <div className="post-footer">
        <span>Burns in: {timeLeft} 🔥</span>
      </div>
    </div>
  );
};

export default Post;
