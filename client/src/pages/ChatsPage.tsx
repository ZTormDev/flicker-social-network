import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/chatspage.scss";

interface Chat {
  id: number;
  otherUser: {
    id: number;
    username: string;
    userImage: string;
    isOnline: boolean;
    lastSeen: string;
  };
  lastMessage: {
    id: number;
    content: string;
    senderId: number;
    read: boolean;
    createdAt: string;
    sender: {
      id: number;
      username: string;
    };
  };
  unreadCount: number;
}

interface MessagesPageProps {
  profile: any;
  onLogout: () => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ profile, onLogout }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/chats/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (username: string) => {
    navigate(`/chats/${username}`);
  };

  return (
    <div className="messages-page">
      <Header onLogout={onLogout} />
      <div className="messages-container">
        <h2>Messages</h2>
        {loading ? (
          <div className="loading">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="no-messages">No messages yet</div>
        ) : (
          <div className="conversations-list">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="conversation-item"
                onClick={() => handleChatClick(chat.otherUser.username)}
              >
                <div className="conversation-avatar">
                  <img src={chat.otherUser.userImage} alt="Profile" />
                  <span
                    className={`status-indicator ${
                      chat.otherUser.isOnline ? "online" : "offline"
                    }`}
                  />
                </div>
                <div className="conversation-details">
                  <div className="conversation-header">
                    <h3>{chat.otherUser.username}</h3>
                    {chat.lastMessage && (
                      <span className="last-message-time">
                        {new Date(
                          chat.lastMessage.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p
                      className={`last-message ${
                        !chat.lastMessage.read &&
                        chat.lastMessage.senderId !== profile.id
                          ? "unread"
                          : ""
                      }`}
                    >
                      {chat.lastMessage.content}
                    </p>
                  )}
                  {chat.unreadCount > 0 && (
                    <span className="unread-count">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
