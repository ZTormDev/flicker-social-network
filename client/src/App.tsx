import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./components/HomePage";
import LoadingScreen from "./components/LoadingScreen";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SearchResults from "./components/SearchResults";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const minimunLoadingTime = 3000;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      await new Promise((resolve) => setTimeout(resolve, minimunLoadingTime));
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    setIsLoading(true);
    localStorage.removeItem("token");
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
    }, minimunLoadingTime);
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
  };

  const handleRegistrationSuccess = () => {
    setIsLoading(true);
    setShowRegister(false);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, minimunLoadingTime);
  };

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, minimunLoadingTime);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      {isLoggedIn ? (
        <Routes>
          <Route path="/" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <div
          className={
            showRegister ? "auth-container register" : "auth-container login"
          }
        >
          {showRegister ? (
            <>
              <Register onRegisterSuccess={handleRegistrationSuccess} />
              <button className="toggle-button" onClick={toggleRegister}>
                Already have an account? Sign in
              </button>
            </>
          ) : (
            <>
              <Login onLogin={handleLogin} />
              <button className="toggle-button" onClick={toggleRegister}>
                Don't have an account? Sign up
              </button>
            </>
          )}
        </div>
      )}
    </Router>
  );
}

export default App;
