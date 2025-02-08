import React from "react";
import Feed from "./Feed";
import "../styles/homepage.css";
import Sidebar from "./SideBar";

interface HomePageProps {
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLogout }) => {
  return (
    <div className="homepage-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>Flicker</h1>
          <img src="flickercolor.png" alt="flicker logo" />
        </div>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </nav>
      <div className="main-content">
        <Feed />
        <Sidebar onLogout={onLogout} />
      </div>
    </div>
  );
};

export default HomePage;
