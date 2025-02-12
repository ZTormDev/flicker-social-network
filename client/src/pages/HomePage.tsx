import React, { useState } from "react";
import Feed from "../components/Feed";
import "../styles/homepage.css";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import SearchResults from "./SearchResults";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number;
  following: number;
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
        <Sidebar
          profile={profile}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

export default HomePage;
