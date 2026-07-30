import { FiShield, FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";
import "./Footer.css";

const COLUMNS = [
  {
    title: "Platform",
    links: ["Network Discovery", "Port & Service Scanning", "OS Fingerprinting", "Risk Engine", "Reporting"],
  },
  {
    title: "Company",
    links: ["About", "Security", "Changelog", "Careers"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Status Page", "Support"],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <div className="footer__brand-row">
            <FiShield className="footer__icon" />
            <span>NetGuard</span>
          </div>
          <p>Network reconnaissance and asset intelligence for security teams who need ground truth about their infrastructure.</p>
          <div className="footer__social">
            <a href="#" aria-label="GitHub"><FiGithub /></a>
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="footer__col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link}><a href="#">{link}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} NetGuard. All rights reserved.</span>
        <div className="footer__legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Responsible Disclosure</a>
        </div>
      </div>
    </footer>
  );
}
