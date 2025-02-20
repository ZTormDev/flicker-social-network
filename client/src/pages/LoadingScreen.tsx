import React from "react";
import "../styles/loadingscreen.scss";
import FlickerLogo from "../assets/flicker.png";

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <h1 className="loading-text">Flicker</h1>
        <div className="logo-container">
          <img src={FlickerLogo} className="logo" alt="Flicker Logo" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
