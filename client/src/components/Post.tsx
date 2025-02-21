import React, { useState, useEffect, useRef } from "react";
import "../styles/post.scss";
import { faFlag, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import FollowButton from "./UI/FollowButton";

import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faComment as faCommentSolid } from "@fortawesome/free-solid-svg-icons";
import { faPaperPlane as faShareSolid } from "@fortawesome/free-solid-svg-icons";

import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { faComment as faCommentRegular } from "@fortawesome/free-regular-svg-icons";
import { faPaperPlane as faShareRegular } from "@fortawesome/free-regular-svg-icons";
import Fire from "../assets/fire.png";
import FullPost from "./FullPost";
import MediaCarrousel from "./MediaCarrousel";

interface Post {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
  expires_at: string;
  media: string[];
  likes: number;
  userLiked: boolean;
  user: {
    username: string;
    userimage: string;
    followers: number;
    following: number;
  };
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number;
  following: number;
}

interface PostProps {
  post: Post;
  profile: UserProfile | null;
  onDelete?: (postId: number) => void;
  onFollowUpdate: (isFollowing: boolean) => void;
}

const Post: React.FC<PostProps> = ({
  post,
  onDelete,
  profile,
  onFollowUpdate,
}) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [isBurning, setIsBurning] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showShowMore, setShowShowMore] = useState(false);
  const maxHeight = 150; // Height in pixels before truncating
  const [isVisible, setIsVisible] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(post.userLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isCountAnimating, setIsCountAnimating] = useState(false);

  const [showFullPost, setShowFullPost] = useState(false);

  const fetchLikeCount = async (postId: number, token: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/likes/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return { count: data.count, userLiked: data.userLiked };
      }
      return null;
    } catch (error) {
      console.error("Error fetching like count:", error);
      return null;
    }
  };

  // Update the likes count effect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const updateLikes = async () => {
      const result = await fetchLikeCount(post.id, token);
      if (result) {
        // Solo actualizar si hay un cambio real en likes o estado de like
        const hasChanges =
          result.count !== likesCount || result.userLiked !== isLiked;

        if (hasChanges) {
          setIsCountAnimating(true);
          setLikesCount(result.count);
          setIsLiked(result.userLiked);
          setTimeout(() => setIsCountAnimating(false), 500);
        }
      }
    };

    // Initial fetch
    updateLikes();

    // Set up interval
    const intervalId = setInterval(updateLikes, 5000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [post.id, likesCount, isLiked]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        const response = await fetch(
          `http://localhost:5000/api/likes/${post.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          setIsLiked(false);
          setLikesCount((prev) => prev - 1);
        }
      } else {
        const response = await fetch("http://localhost:5000/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ post_id: post.id }),
        });

        if (response.ok) {
          setIsLiked(true);
          setLikesCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Add this function before the return statement
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${post.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        onDelete(post.id);
      } else {
        console.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Update the useEffect that checks content height
  useEffect(() => {
    const checkContentHeight = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const shouldShowMore = contentHeight > maxHeight;
        setShowShowMore(shouldShowMore);

        // If content is shorter than maxHeight, ensure it's not marked as expanded
        if (!shouldShowMore && isExpanded) {
          setIsExpanded(false);
        }
      }
    };

    checkContentHeight();

    // Add resize listener to recheck height when window size changes
    window.addEventListener("resize", checkContentHeight);

    return () => {
      window.removeEventListener("resize", checkContentHeight);
    };
  }, [post.content, isExpanded]);

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
      if (newTimeLeft == "Expired" && !isBurning) {
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

  // Add this effect to handle clicking outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        postRef.current &&
        !postRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <>
      <div
        ref={postRef}
        data-post-id={post.id}
        className={`post ${isBurning ? "burning" : ""} ${
          isExpiringSoon() ? "expires-soon" : ""
        } ${isVisible ? "visible" : ""}`}
      >
        <div className="post-header-container">
          <div className="post-header">
            <img
              src={post.user?.userimage}
              alt={post.user?.username || "Default User"}
              className="avatar"
            />
            <div className="post-info">
              <div className="username-follow">
                <h3>{post.user?.username || "Unknown User"}</h3>

                <FollowButton
                  profile={profile}
                  user={{
                    id: post.user_id,
                    username: post.user?.username || "",
                    followers: post.user?.followers || 0,
                    following: post.user?.following || 0,
                  }}
                  onFollowChange={(newFollowerCount, isFollowing) => {
                    onFollowUpdate(isFollowing);
                    // Update local post user data
                    if (post.user) {
                      post.user.followers = newFollowerCount;
                    }
                  }}
                />
              </div>
              <span className="timestamp">{formatDate(post.created_at)}</span>
            </div>
          </div>
          <div className="post-header-actions">
            <button
              className="menu-button"
              onClick={() => {
                setShowMenu(!showMenu);
              }}
              aria-label="Post menu"
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            {showMenu && (
              <div className="post-menu">
                <button className="report-button">
                  Report <FontAwesomeIcon icon={faFlag} />
                </button>
                {Number(post.user_id) == Number(profile?.id) && (
                  <button onClick={handleDelete} className="delete-button">
                    Delete <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {post.media && post.media.length > 0 && (
          <>
            <MediaCarrousel post={post}></MediaCarrousel>
            <div className="post-actions">
              <button
                className={`action-button like-button ${
                  isLiked ? "liked" : ""
                }`}
                onClick={handleLike}
              >
                <FontAwesomeIcon
                  icon={isLiked ? faHeartSolid : faHeartRegular}
                />
                <div>
                  <span className={isCountAnimating ? "count-change" : ""}>
                    {likesCount}
                  </span>
                  <span>likes</span>
                </div>
              </button>
              <button className={`action-button comment-button`}>
                <FontAwesomeIcon icon={faCommentRegular} />
              </button>
              <button className={`action-button share-button`}>
                <FontAwesomeIcon icon={faShareRegular} />
              </button>
            </div>
          </>
        )}
        <div
          ref={contentRef}
          className={`post-content ${isExpanded ? "expanded" : ""} ${
            showShowMore ? "can-expand" : ""
          }`}
        >
          {post.media && post.media.length > 0 ? (
            <>
              <p className="post-text">
                <b>{post.user?.username || "Unknown User"} </b> {post.content}
              </p>
            </>
          ) : (
            <>
              <p className="post-text">{post.content}</p>
            </>
          )}
        </div>
        {showShowMore && (
          <button
            className="show-more-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
        {post.media && post.media.length == 0 && (
          <div className="post-actions">
            <button
              className={`action-button like-button ${isLiked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} />
              <div>
                <span className={isCountAnimating ? "count-change" : ""}>
                  {likesCount}
                </span>
                <span>likes</span>
              </div>
            </button>
            <button className={`action-button comment-button`}>
              <FontAwesomeIcon icon={faCommentRegular} />
            </button>
            <button className={`action-button share-button`}>
              <FontAwesomeIcon icon={faShareRegular} />
            </button>
          </div>
        )}
        <div className="comments-section">
          <button
            className="view-comments-button"
            onClick={() => setShowFullPost(true)}
          >
            View all 100 comments
          </button>
          <button
            className="add-comment-button"
            onClick={() => setShowFullPost(true)}
          >
            Add a comment...
          </button>
        </div>
        <div className="post-footer">
          <span className={isExpiringSoon() ? "expires-soon" : ""}>
            {timeLeft == "Expired" ? "" : `Burns in: ${timeLeft} 🔥`}
          </span>
        </div>
        <div className={`burning-overlay ${isExpiringSoon() ? "" : "hidden"}`}>
          <div className="fire">
            <img className="flame1" src={Fire} alt="fire" />
            <img className="flame2" src={Fire} alt="fire" />
            <img className="flame3" src={Fire} alt="fire" />
          </div>
        </div>
      </div>
      {showFullPost && (
        <FullPost
          post={post}
          profile={profile}
          onFollowUpdate={onFollowUpdate}
          onClose={() => setShowFullPost(false)}
        />
      )}
    </>
  );
};

export default Post;
