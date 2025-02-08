import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./components/HomePage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
  };

  const handleRegistrationSuccess = () => {
    setShowRegister(false);
    setIsLoggedIn(true);
  };

  return (
    <>
      {isLoggedIn ? (
        <HomePage onLogout={handleLogout} />
      ) : (
        <div className="auth-container">
          {showRegister ? (
            <>
              <Register onRegisterSuccess={handleRegistrationSuccess} />
              <button className="toggle-button" onClick={toggleRegister}>
                Already have an account? Sign in
              </button>
            </>
          ) : (
            <>
              <Login onLogin={() => setIsLoggedIn(true)} />
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
