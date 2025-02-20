import React, { useState, useEffect, useRef } from "react";
import "../styles/friends.scss";
import { formatLastSeen } from "../utils/dateUtils";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number;
  following: number;
}

interface Friend {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
  Follower: {
    id: string;
    username: string;
    userImage: string;
    isOnline: boolean;
    lastSeen: string;
  };
}

interface FriendsProps {
  profile: UserProfile | null;
}

const Friends: React.FC<FriendsProps> = ({ profile }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const navigate = useNavigate();
  const optionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Add this new useEffect after your existing useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        buttonRef.current &&
        !optionsRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setSelectedFriend(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchFollowings = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/follows/following/${profile?.id}`,
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
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/follows/${profile?.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const followers = await response.json();
      const followings = await fetchFollowings();

      if (followers.length === 0 || followings.length === 0) {
        setFriends([]);
        return;
      } else {
        const mutualFollowers = followers.filter((follower: Friend) => {
          return followings.some((following: Friend) => {
            return follower.follower_id === following.following_id;
          });
        });
        setFriends(mutualFollowers);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFriends();
    const intervalId = setInterval(fetchFriends, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleFriendClick = (friend: Friend) => {
    if (selectedFriend && selectedFriend.id == friend.id) {
      setSelectedFriend(null);
    } else {
      setSelectedFriend(friend);
    }
  };

  if (loading) return <div className="friends-loading">Loading friends...</div>;
  if (error) return <div className="friends-error">{error}</div>;

  return (
    <div className="friends-container">
      <h2>Friends ({friends.length})</h2>
      {friends.length === 0 ? (
        <p className="no-friends">No mutual followers yet</p>
      ) : (
        <div className="friends-list">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className={`friend-item ${
                selectedFriend?.id === friend.id ? "selected" : ""
              }`}
            >
              <div className="friend-avatar-container">
                <img
                  src={friend.Follower.userImage || "/default-avatar.png"}
                  alt={friend.Follower.username}
                  className="friend-avatar"
                />
                <span
                  className={`status-indicator ${
                    friend.Follower.isOnline ? "online" : "offline"
                  }`}
                />
              </div>
              <div className="friend-info">
                <span className="friend-username">
                  {friend.Follower.username}
                </span>
                <span className="friend-status">
                  {friend.Follower.isOnline
                    ? "Online"
                    : `Online ${formatLastSeen(friend.Follower.lastSeen)}`}
                </span>
              </div>
              <div className="friend-options-container">
                <button
                  ref={buttonRef}
                  className={`friend-options-button ${
                    selectedFriend?.id === friend.id ? "selected" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFriendClick(friend);
                  }}
                >
                  <FontAwesomeIcon icon={faCaretDown} />
                </button>
                {selectedFriend && selectedFriend.id === friend.id && (
                  <div ref={optionsRef} className="options-container">
                    <button className="option">Open Chat</button>
                    <button
                      className="option"
                      onClick={() =>
                        navigate(`/profile/${friend.Follower.username}`)
                      }
                    >
                      View Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;
