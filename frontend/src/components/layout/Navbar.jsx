import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX, FiShield } from "react-icons/fi";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Platform", href: "/#platform" },
  { label: "Features", href: "/#features" },
  { label: "Services", href: "/#services" },
  { label: "Pricing", href: "/#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          <FiShield className="navbar__brand-icon" />
          <span>NetGuard</span>
        </Link>

        <nav className="navbar__links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href}>{link.label}</a>
          ))}
        </nav>

        <div className="navbar__actions">
          <ThemeToggle />
          {user ? (
            <>
              <NavLink to="/dashboard" className="btn btn-ghost">Dashboard</NavLink>
              <button className="btn btn-primary" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Start free scan</Link>
            </>
          )}
        </div>

        <button className="navbar__burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="navbar__mobile">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <div className="navbar__mobile-actions">
            <ThemeToggle />
            {user ? (
              <button className="btn btn-primary" onClick={logout}>Sign out</button>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" onClick={() => setOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>Start free scan</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
