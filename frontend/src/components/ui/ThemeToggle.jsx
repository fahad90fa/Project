import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext.jsx";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark and light theme"
    >
      <span className={`theme-toggle__thumb ${isDark ? "is-dark" : "is-light"}`}>
        {isDark ? <FiMoon size={12} /> : <FiSun size={12} />}
      </span>
    </button>
  );
}
