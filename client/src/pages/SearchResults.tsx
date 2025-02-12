import React, { useState, useEffect } from "react";
import "../styles/searchresults.css";
import Post from "../components/Post";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
interface SearchUser {
  id: number;
  username: string;
  userImage: string;
  followers: number; // Add these fields
  following: number; // Add these fields
}

interface SearchPost {
  id: number;
  content: string;
  user_id: number;
  user: {
    username: string;
    userimage: string; // Note: using lowercase 'userimage'
  };
  created_at: string;
  expires_at: string;
  media?: string[];
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number; // Add these fields
  following: number; // Add these fields
}

interface SearchResultsProps {
  profile: UserProfile | null;
  query: string;
  onFollowUpdate: (isFollowing: boolean) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  profile,
  query,
  onFollowUpdate,
}) => {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      if (!profile?.id) return;

      setLoading(true);
      setError("");

      try {
        const [usersResponse, postsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/search/users?q=${query}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch(`http://localhost:5000/api/search/posts?q=${query}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        if (!usersResponse.ok || !postsResponse.ok) {
          throw new Error("Failed to fetch search results");
        }

        const [usersData, postsData] = await Promise.all([
          usersResponse.json(),
          postsResponse.json(),
        ]);

        // Remove follow status checking since it's now handled in FollowButton
        setUsers(usersData);
        setPosts(postsData);
      } catch (err) {
        setError("Failed to fetch search results");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query && profile?.id) {
      fetchResults();
    }
  }, [query, profile?.id]);

  const handleDeletePost = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  if (loading) {
    return <div className="search-loading"></div>;
  }

  if (error) {
    return <div className="search-error">{error}</div>;
  }

  return (
    <div className="search-container">
      <div className="title">
        <div className="search-header">
          <h2>Search Results for: </h2>
          <h2 className="query">{`"${query}"`}</h2>
        </div>
        <button className="goback-button">
          go back <FontAwesomeIcon icon={faHouse} />
        </button>
      </div>

      {users.length == 0 && posts.length == 0 && (
        <p>No results found for your search.</p>
      )}

      {users.length > 0 && (
        <section className="users-results">
          <h3>Users</h3>
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <img
                  src={user.userImage}
                  alt="Profile"
                  className="profile-avatar"
                />
                <div className="profile-details">
                  <h3>{user.username}</h3>
                  <div className="profile-stats">
                    <div className="profile-posts">
                      <p>
                        <b>0</b>
                      </p>
                      <p>posts</p>
                    </div>
                    <div className="profile-followers">
                      <p>
                        <b>{user.followers}</b>
                      </p>
                      <p>followers</p>
                    </div>
                    <div className="profile-following">
                      <p>
                        <b>{user.following}</b>
                      </p>
                      <p>following</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="posts-results">
          <h3>Posts</h3>
          <div className="posts-list">
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                profile={profile}
                onDelete={handleDeletePost}
                onFollowUpdate={onFollowUpdate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchResults;
