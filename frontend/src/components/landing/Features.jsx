import { FiRadio, FiGrid, FiCpu, FiActivity, FiBell, FiFileText } from "react-icons/fi";
import "./landing-shared.css";

const FEATURES = [
  { icon: <FiRadio />, title: "Host Discovery", desc: "Sweep any IP range or domain list to find every live host, resolved and verified before a single port is touched." },
  { icon: <FiGrid />, title: "Port & Service Scanning", desc: "Concurrent, configurable port scans with banner-grab service detection across the full 1–65535 range." },
  { icon: <FiCpu />, title: "OS Fingerprinting", desc: "TTL and TCP window based OS detection identifies Linux, Windows, and Mac hosts, with a graceful fallback when raw sockets aren't available." },
  { icon: <FiActivity />, title: "Risk Scoring Engine", desc: "Every host is scored on exposed dangerous ports, unknown OS, and attack-surface size — then classified Critical to Informational." },
  { icon: <FiBell />, title: "Real-Time Alerting", desc: "Get notified the moment a scan turns up a Critical or High risk asset, not after your weekly report goes out." },
  { icon: <FiFileText />, title: "Executive Reporting", desc: "One-click PDF and CSV reports with scan timelines, risk breakdowns, and remediation recommendations." },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Platform capabilities</span>
          <h2>Everything a SOC needs from recon to remediation</h2>
        </div>
        <div className="grid-3">
          {FEATURES.map((f) => (
            <div className="tile" key={f.title}>
              <div className="tile__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
