import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/profile.scss";
import Post from "../components/Post";
import { formatLastSeen } from "../utils/dateUtils";
import Header from "../components/Header";
import FollowButton from "../components/UI/FollowButton";

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

interface Post {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
  expires_at: string;
  media?: string[];
  user?: {
    username: string;
    userImage: string;
    followers: number;
    following: number;
  };
}

interface ProfileProps {
  onLogout: () => void;
  thisProfile: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ onLogout, thisProfile }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/username/${username}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          navigate("/404", { replace: true });
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      setError("Error loading profile");
      console.error("Error:", error);
    }
  };

  const fetchUserPosts = async () => {
    if (!profile) return; // Add this check

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/user/${profile.id}`, // Use profile.id instead of username
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      await fetchProfile();
    };

    fetchData();
  }, [username]);

  // Initial posts fetch and setup polling
  useEffect(() => {
    if (!profile) return;

    // Initial fetch
    fetchUserPosts();

    // Set up polling
    const intervalId = setInterval(() => {
      fetchProfile();
      fetchUserPosts();
    }, 5000); // 5 seconds

    // Cleanup function
    return () => {
      clearInterval(intervalId);
    };
  }, [profile?.id, username]); // Dependencies array includes profile.id and username

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return null;

  return (
    <div className="profile-container">
      <Header onLogout={onLogout}></Header>
      <div className="profile-page">
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="profile-info">
            <div className="profile-avatar-container">
              <img
                src={profile.userImage}
                alt={profile.username}
                className="profile-avatar"
              />
              <span
                className={`status-indicator ${
                  profile.isOnline ? "online" : "offline"
                }`}
              />
            </div>
            <div className="profile-details">
              <h1>{profile.username}</h1>
              <span
                className={`profile-status ${
                  profile.isOnline ? "online" : "offline"
                }`}
              >
                {profile.isOnline
                  ? "Online"
                  : `Online ${formatLastSeen(profile.lastSeen)}`}
              </span>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-value">{posts.length}</span>
                  <span className="stat-label">posts</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{profile.followers}</span>
                  <span className="stat-label">followers</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{profile.following}</span>
                  <span className="stat-label">following</span>
                </div>
              </div>
              <FollowButton profile={thisProfile} user={profile}></FollowButton>
            </div>
          </div>
        </div>

        <div className="profile-posts">
          <h2>{username} Posts</h2>
          <div className="posts-container">
            {posts.length === 0 && !loading ? (
              <div className="no-posts">No posts yet</div>
            ) : (
              posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  profile={profile}
                  onDelete={handleDeletePost}
                  onFollowUpdate={() => {}}
                />
              ))
            )}
            {loading && <div className="loading">Loading posts...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
