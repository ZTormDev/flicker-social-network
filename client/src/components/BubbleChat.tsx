import React from "react";
import "../styles/bubblechat.scss";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface BubbleChatProps {
  message: {
    content: string;
    createdAt: string;
    read: boolean;
    sender: {
      username: string;
      userImage: string;
    };
  };
  isOwnMessage: boolean;
  isLast: boolean;
}

const BubbleChat: React.FC<BubbleChatProps> = ({
  message,
  isOwnMessage,
  isLast,
}) => {
  return (
    <div
      id={isLast ? "last-message" : ""}
      className={`message-bubble ${
        isOwnMessage ? "own-message" : "other-message"
      }`}
    >
      {!isOwnMessage && (
        <img
          src={message.sender.userImage}
          alt={message.sender.username}
          className="sender-avatar"
        />
      )}
      <div className="message-content">
        <p>{message.content}</p>
        <div className="message-info">
          <span className="message-time">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isOwnMessage && (
            <div className={`message-status ${message.read ? "read" : ""}`}>
              <FontAwesomeIcon icon={faCheck} />
              <FontAwesomeIcon icon={faCheck} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BubbleChat;
