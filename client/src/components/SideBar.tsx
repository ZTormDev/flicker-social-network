import React, { useState, useEffect } from "react";
import "../styles/sidebar.css";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom"; // Add this import

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
}

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <div className="sidebar-container">
      <form className="searchbar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search users, posts, etc..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button type="submit" className="search-button">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </form>
      <div className="sidebar">
        {profile && (
          <div className="profile-section">
            <div className="profile-info">
              <img
                src={profile.userImage}
                alt="Profile"
                className="profile-avatar"
              />
              <div className="profile-details">
                <h3>{profile.username}</h3>
                <div className="profile-stats">
                  <div className="profile-posts">
                    <p>
                      <b>0</b>
                    </p>
                    <p>posts</p>
                  </div>
                  <div className="profile-followers">
                    <p>
                      <b>0</b>
                    </p>
                    <p>followers</p>
                  </div>
                  <div className="profile-following">
                    <p>
                      <b>0</b>
                    </p>
                    <p>following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="friends-section">
          <h2>Friends</h2>
          <div className="friends-list">a</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
