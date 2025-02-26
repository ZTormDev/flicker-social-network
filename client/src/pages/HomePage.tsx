import React, { useEffect, useState } from "react";
import Feed from "../components/Feed";
import "../styles/homepage.scss";
import RightSidebar from "../components/RightSideBar";
import Header from "../components/Header";
import SearchResults from "./SearchResults";
import LeftSidebar from "../components/LeftSideBar";

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

interface HomePageProps {
  onLogout: () => void;
  profile: UserProfile | null;
}

const HomePage: React.FC<HomePageProps> = ({
  onLogout,
  profile: initialProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);

  // Add this function to handle follow updates
  const handleFollowUpdate = (isFollowing: boolean) => {
    if (profile) {
      setProfile({
        ...profile,
        following: profile.following + (isFollowing ? 1 : -1),
      });
    }
  };

  const fetchCurrentProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchCurrentProfile();
    const intervalId = setInterval(fetchCurrentProfile, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (!profile) {
    return;
  }

  return (
    <div className="homepage-container">
      <Header onLogout={onLogout} />
      <div className="main-content">
        {searchQuery ? (
          <SearchResults
            profile={profile}
            query={searchQuery}
            onFollowUpdate={handleFollowUpdate}
          />
        ) : (
          <Feed
            profile={profile}
            onFollowUpdate={handleFollowUpdate} // Add this prop
          />
        )}
        <RightSidebar
          profile={profile}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default HomePage;
