import React, { useState } from "react";
import "../styles/register.scss";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FlickerLogoColor from "../assets/flickercolor.png";

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userImage, setUserImage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, userImage }), // Include userImage
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        onRegisterSuccess();
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Registration failed");
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="auth-register">
      <div className="auth-title">
        <h2>Register to</h2>
        <div className="auth-logo">
          <h2>Flicker</h2>
          <img src={FlickerLogoColor} alt="flicker logo" />
        </div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group-register">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            placeholder="Username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group-register">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            placeholder="Email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group-register">
          <label htmlFor="password">Password:</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="password"
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </button>
          </div>
        </div>
        <div className="form-group-register">
          <label htmlFor="userImage">User Image URL:</label>
          <input
            type="text"
            placeholder="User Image URL"
            id="userImage"
            value={userImage}
            onChange={(e) => setUserImage(e.target.value)}
            autoComplete="userImage"
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
