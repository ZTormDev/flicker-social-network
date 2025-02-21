import React from "react";
import "../styles/leftSidebar.scss";

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

interface SidebarProps {
  profile: UserProfile | null;
}

const LeftSidebar: React.FC<SidebarProps> = ({ profile }) => {
  return (
    <div className="sidebar-container">
      <div className="sidebar">a</div>
    </div>
  );
};

export default LeftSidebar;
