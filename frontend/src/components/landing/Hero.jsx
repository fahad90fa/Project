import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ScanVisual from "./ScanVisual.jsx";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <motion.div
          className="hero__copy"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="eyebrow">Network Reconnaissance &amp; Asset Intelligence</span>
          <h1 className="hero__headline">
            See every host on your network<br />before someone else does.
          </h1>
          <p className="hero__sub">
            NetGuard discovers live hosts, open ports, running services, and operating
            systems across your infrastructure — then scores every asset by real risk,
            in real time.
          </p>
          <div className="hero__cta-row">
            <Link to="/register" className="btn btn-primary">
              Start a free scan <FiArrowRight />
            </Link>
            <a href="#platform" className="btn btn-ghost">See how it works</a>
          </div>
          <div className="hero__trust">
            <span>Trusted for internal, authorized asset discovery by security teams at</span>
            <div className="hero__trust-logos">
              <span>FinLedger</span><span>Norvik Labs</span><span>Cascade Health</span><span>Trestle Bank</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        >
          <ScanVisual />
        </motion.div>
      </div>
    </section>
  );
}
