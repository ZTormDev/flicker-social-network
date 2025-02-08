import React from "react";
import "../styles/loadingscreen.css";

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <h1 className="loading-text">Flicker</h1>
        <div className="logo-container">
          <img src="flicker.png" className="logo" alt="Flicker Logo" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
