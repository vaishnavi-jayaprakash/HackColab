import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import "./PageLayout.css";

export default function PageLayout({ navbarContent, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Navbar>{navbarContent}</Navbar>
        <main>{children}</main>
      </div>
    </div>
  );
}
