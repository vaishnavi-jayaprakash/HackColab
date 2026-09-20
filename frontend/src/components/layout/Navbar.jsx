import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { initialsFromName } from "../../utils/format.js";
import "./Navbar.css";

export default function Navbar({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">{children}</div>
      <div className="navbar-right">
        <div className="navbar-avatar-wrap">
          <button className="navbar-avatar" onClick={() => setShowMenu((v) => !v)}>
            {user ? initialsFromName(user.name) : "?"}
          </button>
          {showMenu && (
            <div className="navbar-menu" onMouseLeave={() => setShowMenu(false)}>
              <p className="navbar-menu-name">{user?.name}</p>
              <p className="navbar-menu-email">{user?.email}</p>
              <button type="button" className="navbar-menu-logout" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
