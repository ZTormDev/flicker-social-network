import React, { useState, useEffect, useRef } from "react";
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
    created_at?: string; // Make optional
    expires_at: string;
    media?: string[];
  };
  onDelete?: (id: number) => void;
}

const Post: React.FC<PostProps> = ({ post, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [isBurning, setIsBurning] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showShowMore, setShowShowMore] = useState(false);
  const maxHeight = 100; // Height in pixels before truncating

  const [isVisible, setIsVisible] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setShowShowMore(contentRef.current.scrollHeight > maxHeight);
    }
  }, [post.content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
      }
    );

    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newTimeLeft = getTimeLeft();
      setTimeLeft(newTimeLeft);

      // Check if post has expired
      if (newTimeLeft === "Expired" && !isBurning) {
        setIsBurning(true);
        // Wait for burning animation to complete before removing the post
        setTimeout(() => {
          if (onDelete) {
            onDelete(post.id);
          }
        }, 2500); // Match this with the CSS animation duration
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [post.expires_at, isBurning, onDelete, post.id]);

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

  const formatDate = (dateString: string | undefined) => {
    try {
      if (!dateString) {
        return "Date unavailable";
      }

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

  const isExpiringSoon = () => {
    const now = new Date().getTime();
    const expireTime = new Date(post.expires_at).getTime();
    const timeToExpire = expireTime - now;
    return timeToExpire > 0 && timeToExpire < 1 * 60 * 1000; // Less than 5 minutes
  };

  return (
    <div
      ref={postRef}
      className={`post ${isBurning ? "burning" : ""}${
        isExpiringSoon() ? "expires-soon" : ""
      }${isVisible ? "visible" : ""}`}
    >
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
      <div
        ref={contentRef}
        className={`post-content ${isExpanded ? "expanded" : ""} ${
          showShowMore ? "can-expand" : ""
        }`}
      >
        {post.content}
      </div>
      {showShowMore && (
        <button
          className="show-more-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
      {post.media && post.media.length > 0 && (
        <div className="post-media">
          {post.media.map((mediaUrl, index) => (
            <div key={index} className="media-item">
              {mediaUrl.endsWith(".mp4") ? (
                <video
                  src={`https://xq1jpm39-5000.brs.devtunnels.ms/${mediaUrl}`}
                  controls
                />
              ) : (
                <img
                  src={`https://xq1jpm39-5000.brs.devtunnels.ms/${mediaUrl}`}
                  alt="Media"
                />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="post-footer">
        <span className={isExpiringSoon() ? "expires-soon" : ""}>
          {timeLeft === "Expired" ? "" : `Burns in: ${timeLeft} 🔥`}
        </span>
      </div>
      <div className={`burning-overlay ${isExpiringSoon() ? "" : "hidden"}`}>
        <div className="fire">
          <img className="flame1" src="fire.png" alt="fire" />
          <img className="flame2" src="fire.png" alt="fire" />
          <img className="flame3" src="fire.png" alt="fire" />
        </div>
      </div>
    </div>
  );
};

export default Post;
