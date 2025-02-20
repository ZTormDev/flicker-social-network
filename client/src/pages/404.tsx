import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/404.scss";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/")}>Return Home</button>
      </div>
    </div>
  );
};

export default NotFound;
