import React from "react";
import "../styles/sidebar.css";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Friends from "./Friends";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number;
  following: number;
}

interface SidebarProps {
  profile: UserProfile | null;
  onSearch: (query: string) => void;
  searchQuery: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  profile,
  onSearch,
  searchQuery,
}) => {
  const handleSearch = (query: string) => {
    onSearch(query);
  };

  return (
    <div className="sidebar-container">
      <div className="searchbar">
        <input
          type="text"
          placeholder="Search users, posts, etc..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button className="search-button">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
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
                      <b>{profile.followers}</b>
                    </p>
                    <p>followers</p>
                  </div>
                  <div className="profile-following">
                    <p>
                      <b>{profile.following}</b>
                    </p>
                    <p>following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Friends profile={profile} />
    </div>
  );
};

export default Sidebar;
