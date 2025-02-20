import { useNavigate } from "react-router-dom";
import FlickerLogoColor from "../assets/flickercolor.png";
import "../styles/header.scss";

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")}>
        <h1>Flicker</h1>
        <img src={FlickerLogoColor} alt="flicker logo" />
      </div>
      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Header;
