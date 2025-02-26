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
import Chat from "./components/Chat";
import MessagesPage from "./pages/ChatsPage";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  userImage: string;
  followers: number;
  following: number;
  isOnline: boolean; // Añadido
  lastSeen: string; // Añadido
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const minimunLoadingTime = 3000;

  const sendHeartbeat = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch("http://localhost:5000/api/users/heartbeat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Heartbeat error:", error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    // Initial heartbeat
    sendHeartbeat();

    // Set up heartbeat interval
    const heartbeatInterval = setInterval(sendHeartbeat, 5000);

    // Cleanup function
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [isLoggedIn]);

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
          <Route
            path="/chats"
            element={<MessagesPage onLogout={handleLogout} profile={profile} />}
          />
          <Route path="/chats/:username" element={<Chat profile={profile} />} />
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
