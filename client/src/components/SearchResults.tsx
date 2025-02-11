import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/searchresults.css";
import Post from "./Post";

interface SearchUser {
  id: number;
  username: string;
  userImage: string;
}

interface SearchPost {
  id: number;
  content: string;
  user: {
    username: string;
    userImage: string; // Cambiado de userimage a userImage
  };
  created_at: string;
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
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

        setUsers(usersData);
        setPosts(postsData);
      } catch (err) {
        setError("Failed to fetch search results");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  if (loading) {
    return <div className="search-loading">Loading...</div>;
  }

  if (error) {
    return <div className="search-error">{error}</div>;
  }

  return (
    <div className="search-results">
      <h2>Search Results for "{query}"</h2>

      {users.length === 0 && posts.length === 0 && (
        <p>No results found for your search.</p>
      )}

      {users.length > 0 && (
        <section className="users-results">
          <h3>Users</h3>
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <img src={user.userImage} alt={user.username} />
                <h4>{user.username}</h4>
              </div>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="posts-results">
          <h3>Posts</h3>
          <div className="posts-list">
            {posts.map((post, index) => {
              if (posts.length === index + 1) {
                return (
                  <div ref={lastPostElementRef} key={post.id}>
                    <Post
                      key={post.id}
                      post={post}
                      onDelete={handleDeletePost}
                      currentUserId={currentUserId}
                    />
                  </div>
                );
              } else {
                return (
                  <Post
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                    currentUserId={currentUserId}
                  />
                );
              }
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchResults;
