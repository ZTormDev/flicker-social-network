import React, { useState, useEffect } from "react";
import "../styles/sidebar.css";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchFriends();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchFriends = async () => {
    // Implement friend fetching logic here
    // This is a placeholder for now
    setFriends([]);
  };

  return (
    <div className="sidebar">
      {profile && (
        <div className="profile-section">
          <div className="profile-info">
            <img
              src="https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Jameson"
              alt="Profile"
              className="profile-avatar"
            />
            <div className="profile-details">
              <h3>{profile.username}</h3>
              <p>{profile.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="friends-section">
        <h2>Friends</h2>
        <div className="friends-list">
          {friends.length === 0 ? (
            <p>No friends yet</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="friend-item">
                <img
                  src={`https://api.dicebear.com/7.x/avatars/svg?seed=${friend.username}`}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <span>{friend.username}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
