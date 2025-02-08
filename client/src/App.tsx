import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./components/HomePage";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const minimunLoadingTime = 3000;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      // Minimum loading time of 2 seconds
      await new Promise((resolve) => setTimeout(resolve, minimunLoadingTime));

      setIsLoggedIn(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    setIsLoading(true);
    localStorage.removeItem("token");

    // Show loading screen for 2 seconds before logging out
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

    // Show loading screen for 2 seconds after registration
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, minimunLoadingTime);
  };

  const handleLogin = () => {
    setIsLoading(true);

    // Show loading screen for 2 seconds after login
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, minimunLoadingTime);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isLoggedIn ? (
        <HomePage onLogout={handleLogout} />
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
    </>
  );
}

export default App;
