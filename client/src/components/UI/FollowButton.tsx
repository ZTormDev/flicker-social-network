import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../styles/followButton.scss";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { useState, useEffect } from "react";

interface FollowData {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

interface UserData {
  id: number;
  followers: number;
  following: number; // Add this property
  username?: string; // Optional since we don't always need it
}

interface FollowButtonProps {
  profile: UserData | null;
  user: UserData;
  onFollowChange?: (newFollowerCount: number, isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  profile,
  user,
  onFollowChange,
}) => {
  const [isFollowing, setFollowingStatus] = useState<boolean>(false);
  // Update event name to be more specific
  const FOLLOW_STATUS_UPDATE = "FOLLOW_STATUS_UPDATE";

  // Add event listener for follow status updates
  useEffect(() => {
    const handleFollowUpdate = (event: CustomEvent) => {
      if (event.detail.userId == user.id) {
        setFollowingStatus(event.detail.isFollowing);
      }
    };

    // Use the custom event name
    document.addEventListener(
      FOLLOW_STATUS_UPDATE,
      handleFollowUpdate as EventListener
    );

    return () => {
      document.removeEventListener(
        FOLLOW_STATUS_UPDATE,
        handleFollowUpdate as EventListener
      );
    };
  }, [user.id]);

  const fetchFollowStatus = async (userId: number): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await fetch(
        `http://localhost:5000/api/follows/following/${profile?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: FollowData[] = await response.json();
        return data.some(
          (follow) => Number(follow.following_id) == Number(userId)
        );
      }
      return false;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  };

  const followUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;

      let response = null;

      if (isFollowing) {
        // Unfollow
        response = await fetch(`http://localhost:5000/api/follows/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Follow
        response = await fetch("http://localhost:5000/api/follows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            follower_id: profile?.id,
            following_id: userId,
          }),
        });
      }

      if (response.ok) {
        const newFollowStatus = !isFollowing; // Directly toggle the status
        setFollowingStatus(newFollowStatus);

        // Dispatch event to update all instances using document instead of window
        const event = new CustomEvent(FOLLOW_STATUS_UPDATE, {
          detail: {
            userId,
            isFollowing: newFollowStatus,
          },
        });
        document.dispatchEvent(event);

        if (onFollowChange) {
          const newFollowerCount = user.followers + (newFollowStatus ? 1 : -1);
          onFollowChange(newFollowerCount, newFollowStatus);
        }
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  // Fetch initial follow status
  useEffect(() => {
    const checkInitialFollowStatus = async () => {
      const status = await fetchFollowStatus(user.id);
      setFollowingStatus(status);
    };
    checkInitialFollowStatus();
  }, [user.id, profile?.id]);

  return (
    <>
      {profile?.id != user.id && (
        <button
          className={
            isFollowing ? "follow-button following" : "follow-button follow"
          }
          onClick={() => followUser(user.id)}
        >
          {isFollowing ? (
            <>
              Unfollow <FontAwesomeIcon icon={faHeartSolid} />
            </>
          ) : (
            <>
              Follow <FontAwesomeIcon icon={faHeartRegular} />
            </>
          )}
        </button>
      )}
    </>
  );
};

export default FollowButton;
