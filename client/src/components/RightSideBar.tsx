import React, { useEffect, useState } from "react";
import "../styles/rightSidebar.scss";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Friends from "./Friends";
import { formatTimeAgo } from "../utils/dateUtils";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number;
  following: number;
  isOnline: boolean;
  lastSeen: string;
}

interface UserPost {
  id: number;
  media?: string[];
  content: string;
  created_at: string; // Add this field
}

interface SidebarProps {
  profile: UserProfile | null;
  onSearch: (query: string) => void;
  searchQuery: string;
}

const RightSidebar: React.FC<SidebarProps> = ({
  profile,
  onSearch,
  searchQuery,
}) => {
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [previewPosts, setPreviewPosts] = useState<UserPost[]>([]);

  const handleSearch = (query: string) => {
    onSearch(query);
  };

  const fetchUserPosts = async () => {
    if (!profile) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/user/${profile.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const posts = await response.json();
        setPreviewPosts(posts.slice(0, 3));
        setUserPosts(posts);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [profile?.id]);

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
          <>
            <div className="profile-section">
              <div className="profile-info">
                <div className="profile-avatar-container">
                  <img
                    src={profile.userImage}
                    alt="Profile"
                    className="profile-avatar"
                  />
                  <span
                    className={`status-indicator ${
                      profile.isOnline ? "online" : "offline"
                    }`}
                  />
                </div>
                <div className="profile-details">
                  <div className="profile-header">
                    <h3>{profile.username}</h3>
                    <span
                      className={`profile-status ${
                        profile.isOnline ? "online" : "offline"
                      }`}
                    >
                      {profile.isOnline
                        ? "Online"
                        : `Online ${formatTimeAgo(profile.lastSeen)}`}
                    </span>
                  </div>
                  <div className="profile-stats">
                    <div className="profile-posts">
                      <p>
                        <b>{userPosts.length}</b>
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
            <div className="profile-posts-preview">
              <h4>Recent Posts</h4>
              <div className="posts-grid">
                {previewPosts.map((post) => (
                  <div key={post.id} className="post-preview">
                    {post.media && post.media[0] ? (
                      <div className="post-preview-content">
                        <img
                          src={`http://localhost:5000/${post.media[0]}`}
                          alt={post.content}
                        />
                        <span className="post-time">
                          {formatTimeAgo(post.created_at)}
                        </span>
                      </div>
                    ) : (
                      <div className="no-media">
                        <p>{post.content.slice(0, 5)}...</p>
                        <span className="post-time">
                          {formatTimeAgo(post.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="view-profile-button"
                onClick={() => navigate(`/profile/${profile.username}`)}
              >
                View Full Profile
              </button>
            </div>
          </>
        )}
      </div>
      <Friends profile={profile} />
    </div>
  );
};

export default RightSidebar;
