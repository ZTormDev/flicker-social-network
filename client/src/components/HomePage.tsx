import React from "react";
import Feed from "./Feed";
import Sidebar from "./Sidebar";
import "../styles/homepage.css";

interface HomePageProps {
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLogout }) => {
  return (
    <div className="homepage-container">
      <nav className="navbar">
        <div className="navbar-brand">Flicker</div>
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
