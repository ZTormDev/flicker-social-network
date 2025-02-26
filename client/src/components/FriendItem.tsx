import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { formatTimeAgo } from "../utils/dateUtils";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

interface Friend {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
  Follower: {
    id: number;
    username: string;
    userImage: string;
    isOnline: boolean;
    lastSeen: string;
  };
}

interface FriendItemProps {
  friend: Friend;
  isSelected: boolean;
  onSelect: (friend: Friend) => void;
  optionsRef: React.RefObject<HTMLDivElement>;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const FriendItem: React.FC<FriendItemProps> = ({
  friend,
  isSelected,
  onSelect,
  optionsRef,
  buttonRef,
}) => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus(friend.Follower.id);

  return (
    <div className={`friend-item ${isSelected ? "selected" : ""}`}>
      <div className="friend-avatar-container">
        <img
          src={friend.Follower.userImage || "/default-avatar.png"}
          alt={friend.Follower.username}
          className="friend-avatar"
        />
        <span
          className={`status-indicator ${isOnline ? "online" : "offline"}`}
        />
      </div>
      <div className="friend-info">
        <span className="friend-username">{friend.Follower.username}</span>
        <span className="friend-status">
          {isOnline
            ? "Online"
            : `Online ${formatTimeAgo(friend.Follower.lastSeen)}`}
        </span>
      </div>
      <div className="friend-options-container">
        <button
          ref={buttonRef}
          className={`friend-options-button ${isSelected ? "selected" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(friend);
          }}
        >
          <FontAwesomeIcon icon={faCaretDown} />
        </button>
        {isSelected && (
          <div ref={optionsRef} className="options-container">
            <button
              onClick={() => navigate(`/chats/${friend.Follower.id}`)}
              className="option"
            >
              Open Chat
            </button>
            <button
              className="option"
              onClick={() => navigate(`/profile/${friend.Follower.username}`)}
            >
              View Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendItem;
