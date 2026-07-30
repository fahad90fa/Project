import { NavLink, Outlet } from "react-router-dom";
import {
  FiGrid, FiServer, FiRadio, FiClock, FiUser, FiSettings, FiShield,
  FiFileText, FiCalendar, FiGitPullRequest,
} from "react-icons/fi";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import NotificationsMenu from "./NotificationsMenu.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./DashboardLayout.css";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: <FiGrid />, end: true },
  { to: "/dashboard/scan", label: "New Scan", icon: <FiRadio /> },
  { to: "/dashboard/history", label: "Scan History", icon: <FiClock /> },
  { to: "/dashboard/compare", label: "Compare Scans", icon: <FiGitPullRequest /> },
  { to: "/dashboard/assets", label: "Asset Inventory", icon: <FiServer /> },
  { to: "/dashboard/schedule", label: "Schedule", icon: <FiCalendar /> },
  { to: "/dashboard/reports", label: "Reports", icon: <FiFileText /> },
  { to: "/dashboard/profile", label: "Profile", icon: <FiUser /> },
  { to: "/dashboard/settings", label: "Settings", icon: <FiSettings /> },
];

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="dash">
      <aside className="dash__sidebar">
        <div className="dash__brand">
          <FiShield className="dash__brand-icon" />
          <span>NetGuard</span>
        </div>
        <nav className="dash__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dash__nav-item ${isActive ? "is-active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="dash__org">
          <span className="dash__org-label">Organization</span>
          <span className="dash__org-name">{user?.organization}</span>
        </div>
      </aside>

      <div className="dash__main">
        <header className="dash__topbar">
          <div className="dash__topbar-status">
            <span className="dash__status-dot" />
            Monitoring active
          </div>
          <div className="dash__topbar-actions">
            <ThemeToggle />
            <NotificationsMenu />
            <div className="dash__avatar" title={user?.name}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </header>
        <main className="dash__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
