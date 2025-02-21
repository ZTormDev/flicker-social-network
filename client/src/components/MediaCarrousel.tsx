import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import "../styles/mediaCarrousel.scss";

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

interface MediaCarrouselProps {
  post: Post;
}

const MediaCarrousel: React.FC<MediaCarrouselProps> = ({ post }) => {
  // Add this state at the beginning of your Post component
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  // Add these new states at the beginning of your Post component
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);

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

  return (
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
              className={`dot ${index == currentMediaIndex ? "active" : ""}`}
              onClick={() => {
                if (isAnimating) return;
                const direction = index > currentMediaIndex ? "left" : "right";
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
  );
};

export default MediaCarrousel;
