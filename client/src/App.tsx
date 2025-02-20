import { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./pages/HomePage";
import LoadingScreen from "./pages/LoadingScreen";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/Profile";
import NotFound from "./pages/404";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number; // Add these fields
  following: number; // Add these fields
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const minimunLoadingTime = 3000;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      await new Promise((resolve) => setTimeout(resolve, minimunLoadingTime));
      setIsLoggedIn(!!token);
      setIsLoading(false);
      fetchProfile();
    };

    checkAuth();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setProfile(null);
        return;
      }

      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error fetching profile:", error);
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setProfile(null);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      await fetchProfile();
      // Ensure minimum loading time
      await new Promise((resolve) => setTimeout(resolve, minimunLoadingTime));
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleLogout = () => {
    setIsLoading(true);
    localStorage.removeItem("token");
    setProfile(null);
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
    setTimeout(async () => {
      await fetchProfile();
      setIsLoggedIn(true);
      setIsLoading(false);
    }, minimunLoadingTime);
  };

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(async () => {
      await fetchProfile();
      setIsLoggedIn(true);
      setIsLoading(false);
    }, minimunLoadingTime);
  };

  // Update the updateOnlineStatus function to include lastSeen
  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch("http://localhost:5000/api/users/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isOnline,
          lastSeen: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  };

  // Add event listeners for online/offline status
  useEffect(() => {
    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false);
    const handleBeforeUnload = () => updateOnlineStatus(false);
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateOnlineStatus(false);
      } else {
        updateOnlineStatus(true);
      }
    };

    // Add all event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set initial online status
    if (isLoggedIn) {
      updateOnlineStatus(navigator.onLine);
    }

    // Cleanup function
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Set offline when component unmounts
      if (isLoggedIn) {
        updateOnlineStatus(false);
      }
    };
  }, [isLoggedIn]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      {isLoggedIn ? (
        <Routes>
          <Route
            path="/"
            element={<HomePage onLogout={handleLogout} profile={profile} />}
          />
          <Route
            path="/profile/:username"
            element={
              isLoggedIn ? (
                <Profile onLogout={handleLogout} thisProfile={profile} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/search"
            element={
              <SearchResults onLogout={handleLogout} profile={profile} />
            }
          />
          <Route path="*" element={<NotFound />} />
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
