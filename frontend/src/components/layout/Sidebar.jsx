import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { initialsFromName } from "../../utils/format.js";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/hackathons", label: "Hackathons", icon: "⚡" },
  { to: "/tasks", label: "Task Board", icon: "✅" },
  { to: "/calendar", label: "Calendar", icon: "📅" },
  { to: "/git", label: "Git", icon: "🔀" },
  { to: "/submission", label: "Submission", icon: "📤" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const hackathonId = pathname.match(/^\/hackathons\/([^/]+)/)?.[1];
  const navItems = hackathonId
    ? NAV_ITEMS.map((item) => {
        const destination = {
          "/tasks": "tasks",
          "/calendar": "calendar",
          "/git": "git",
          "/submission": "submission",
        }[item.to];
        return destination ? { ...item, to: `/hackathons/${hackathonId}/${destination}` } : item;
      })
    : NAV_ITEMS.slice(0, 2);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-mark">⚡</span>
        <span className="sidebar-logo-text">HackColab</span>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? " sidebar-link-active" : ""}`}
              >
                <span className="sidebar-icon" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {user && (
        <div className="sidebar-user">
          <span className="sidebar-avatar">{initialsFromName(user.name)}</span>
          <div>
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-role">{user.role}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
