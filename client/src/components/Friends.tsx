import React, { useState, useEffect } from "react";
import "../styles/friends.css";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number;
  following: number;
}

interface Friend {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
  Follower: {
    id: string;
    username: string;
    userImage: string;
  };
}

interface FriendsProps {
  profile: UserProfile | null;
}

const Friends: React.FC<FriendsProps> = ({ profile }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowings = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/follows/following/${profile?.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/follows/${profile?.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const followers = await response.json();
      const followings = await fetchFollowings();

      if (followers.length === 0 || followings.length === 0) {
        setFriends([]);
        return;
      } else {
        const mutualFollowers = followers.filter((follower: Friend) => {
          return followings.some((following: Friend) => {
            return follower.follower_id === following.following_id;
          });
        });
        setFriends(mutualFollowers);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFriends();
    const intervalId = setInterval(fetchFriends, 500);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="friends-loading">Loading friends...</div>;
  if (error) return <div className="friends-error">{error}</div>;

  return (
    <div className="friends-container">
      <h2>Friends ({friends.length})</h2>
      {friends.length === 0 ? (
        <p className="no-friends">No mutual followers yet</p>
      ) : (
        <div className="friends-list">
          {friends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <img
                src={friend.Follower.userImage || "/default-avatar.png"}
                alt={friend.Follower.username}
                className="friend-avatar"
              />
              <span className="friend-username">
                {friend.Follower.username}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;
