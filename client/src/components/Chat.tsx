import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BubbleChat from "./BubbleChat";
import "../styles/chat.scss";
import {
  faMicrophone,
  faPaperPlane,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Message {
  id: number;
  content: string;
  senderId: number;
  chatId: number;
  read: boolean;
  createdAt: string;
  sender: {
    username: string;
    userImage: string;
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

interface ChatProps {
  profile: UserProfile;
}

const Chat: React.FC<ChatProps> = ({ profile }) => {
  const { username } = useParams();
  const [chatId, setChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const messageCountRef = useRef<number>(0);
  const navigate = useNavigate();

  // First, get or create the chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // First get the user ID from username
        const userResponse = await fetch(
          `http://localhost:5000/api/users/username/${username}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!userResponse.ok) throw new Error("Failed to fetch user");
        const userData = await userResponse.json();
        const otherUserId = userData.id;

        // Then get or create chat with that user ID
        const chatResponse = await fetch(
          `http://localhost:5000/api/chats/with/${otherUserId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!chatResponse.ok) throw new Error("Failed to initialize chat");
        const chat = await chatResponse.json();
        setChatId(chat.id);
        setOtherUser(userData);
        // Add a delay before scrolling
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      } catch (error) {
        console.error("Error:", error);
        navigate("/chats"); // Redirect back to chats list on error
      }
    };

    if (username) {
      initializeChat();
    }
  }, [username]);

  // Then fetch messages when we have a chatId
  useEffect(() => {
    if (chatId) {
      messageCountRef.current = 0;
      fetchMessages();
      const interval = setInterval(fetchMessages, 1000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/chat/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();

      if (data.length > messageCountRef.current) {
        setMessages(data);
        messageCountRef.current = data.length;
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      } else {
        setMessages(data);
        messageCountRef.current = data.length;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      const response = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: newMessage,
          chatId: chatId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const scrollToBottom = () => {
    const messagesEndRef = document.getElementById("last-message");
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        {otherUser && (
          <div className="chat-user-info">
            <img src={otherUser.userImage} alt={otherUser.username} />
            <div className="user-details">
              <h3>{otherUser.username}</h3>
              <span
                className={`status ${
                  otherUser.isOnline ? "online" : "offline"
                }`}
              >
                {otherUser.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <BubbleChat
            key={message.id}
            message={message}
            isOwnMessage={message.senderId == profile.id}
            isLast={index === messages.length - 1}
          />
        ))}
      </div>

      <form className="message-input" onSubmit={handleSend}>
        <button>
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">
          {newMessage.trim() ? (
            <FontAwesomeIcon icon={faPaperPlane} />
          ) : (
            <FontAwesomeIcon icon={faMicrophone} />
          )}
        </button>
      </form>
    </div>
  );
};

export default Chat;
