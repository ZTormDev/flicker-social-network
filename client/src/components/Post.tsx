import React, { useState, useEffect, useRef } from "react";
import "../styles/post.css";
import {
  faAngleLeft,
  faAngleRight,
  faFlag,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import FollowButton from "./UI/FollowButton";

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

  // Add this state at the beginning of your Post component
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  // Add these new states at the beginning of your Post component
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const [showMenu, setShowMenu] = useState(false);

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

  const nextMedia = () => {
    if (isAnimating) return;
    setSlideDirection("left");
    setIsAnimating(true);

    // Pause current video if it exists
    const currentVideo = document.querySelector(
      `[data-post-id="${post.id}"] .media-slide.active video`
    ) as HTMLVideoElement | null;
    if (currentVideo) {
      currentVideo.pause();
    }

    setCurrentMediaIndex((prev) => {
      const nextIndex = prev == (post.media?.length || 0) - 1 ? prev : prev + 1;

      // After state update, play next video if it exists
      setTimeout(() => {
        const nextVideo = document.querySelector(
          `[data-post-id="${post.id}"] .media-slide[data-index="${nextIndex}"] video`
        ) as HTMLVideoElement | null;
        if (nextVideo) {
          nextVideo.currentTime = 0;
          nextVideo.play();
        }
      }, 0);

      return nextIndex;
    });

    setIsAnimating(false);
  };

  const previousMedia = () => {
    if (isAnimating) return;
    setSlideDirection("right");
    setIsAnimating(true);

    // Pause current video if it exists
    const currentVideo = document.querySelector(
      `[data-post-id="${post.id}"] .media-slide.active video`
    ) as HTMLVideoElement | null;
    if (currentVideo) {
      currentVideo.pause();
    }

    setCurrentMediaIndex((prev) => {
      const prevIndex = prev == 0 ? prev : prev - 1;

      // After state update, play previous video if it exists
      setTimeout(() => {
        const prevVideo = document.querySelector(
          `[data-post-id="${post.id}"] .media-slide[data-index="${prevIndex}"] video`
        ) as HTMLVideoElement | null;
        if (prevVideo) {
          prevVideo.currentTime = 0;
          prevVideo.play();
        }
      }, 0);

      return prevIndex;
    });

    setIsAnimating(false);
  };

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
        <div className="post-media-carousel">
          <div className="media-container">
            {post.media.length > 1 && (
              <div className="media-index">
                {currentMediaIndex + 1}/{post.media.length}
              </div>
            )}

            {post.media.map((media, index) => (
              <div
                key={index}
                data-index={index} // Add this attribute
                className={`media-slide ${
                  index == currentMediaIndex ? "active" : ""
                } ${
                  index == currentMediaIndex + 1
                    ? "right"
                    : index == currentMediaIndex - 1
                    ? "left"
                    : ""
                } ${
                  slideDirection && Math.abs(index - currentMediaIndex) == 1
                    ? index > currentMediaIndex
                      ? "right"
                      : "left"
                    : ""
                }`}
                style={{
                  display:
                    Math.abs(index - currentMediaIndex) <= 1 ? "block" : "none",
                }}
              >
                {media.endsWith(".mp4") || media.endsWith(".webm") ? (
                  <video src={`http://localhost:5000/${media}`} controls />
                ) : (
                  <img
                    src={`http://localhost:5000/${media}`}
                    alt={`Media ${index + 1}`}
                    loading="lazy"
                  />
                )}
              </div>
            ))}

            {post.media.length > 1 && (
              <>
                <button
                  className="carousel-button prev"
                  onClick={previousMedia}
                  disabled={currentMediaIndex == 0 || isAnimating}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </button>
                <button
                  className="carousel-button next"
                  onClick={nextMedia}
                  disabled={
                    currentMediaIndex == post.media.length - 1 || isAnimating
                  }
                >
                  <FontAwesomeIcon icon={faAngleRight} />
                </button>
              </>
            )}
          </div>

          {/* Rest of the dots navigation remains the same */}
          {post.media.length > 1 && (
            <div className="media-dots">
              {post.media.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${
                    index == currentMediaIndex ? "active" : ""
                  }`}
                  onClick={() => {
                    if (isAnimating) return;
                    const direction =
                      index > currentMediaIndex ? "left" : "right";
                    setSlideDirection(direction);
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentMediaIndex(index);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  disabled={isAnimating}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div
        ref={contentRef}
        className={`post-content ${isExpanded ? "expanded" : ""} ${
          showShowMore ? "can-expand" : ""
        }`}
      >
        {post.media && post.media.length > 0 && (
          <b>{post.user?.username || "Unknown User"} </b>
        )}
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
      <div className="post-footer">
        <span className={isExpiringSoon() ? "expires-soon" : ""}>
          {timeLeft == "Expired" ? "" : `Burns in: ${timeLeft} 🔥`}
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
