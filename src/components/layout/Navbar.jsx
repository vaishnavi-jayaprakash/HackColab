import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { initialsFromName } from "../../utils/format.js";
import "./Navbar.css";

export default function Navbar({ children, notificationCount = 3 }) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-left">{children}</div>
      <div className="navbar-right">
        <Link to="/notifications" className="navbar-bell" aria-label="Notifications">
          {"\u{1F514}"}
          {notificationCount > 0 && <span className="navbar-bell-count">{notificationCount}</span>}
        </Link>
        <div className="navbar-avatar-wrap">
          <button className="navbar-avatar" onClick={() => setShowMenu((v) => !v)}>
            {user ? initialsFromName(user.name) : "?"}
          </button>
          {showMenu && (
            <div className="navbar-menu" onMouseLeave={() => setShowMenu(false)}>
              <p className="navbar-menu-name">{user?.name}</p>
              <p className="navbar-menu-email">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
