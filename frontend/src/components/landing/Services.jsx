import { FiCheck } from "react-icons/fi";
import "./landing-shared.css";

const SERVICES = [
  {
    name: "On-Demand Recon",
    desc: "Run scans whenever you need ground truth — new acquisitions, pre-audit checks, incident response.",
    items: ["Unlimited manual scans", "Full port range scanning", "PDF & CSV export"],
  },
  {
    name: "Continuous Monitoring",
    desc: "Scheduled recurring scans keep your asset inventory current without anyone remembering to run it.",
    items: ["Daily/weekly scheduling", "Scan comparison & drift alerts", "Real-time risk notifications"],
    featured: true,
  },
  {
    name: "Managed SOC Reporting",
    desc: "For teams who need recon data flowing straight into existing SOC and compliance workflows.",
    items: ["Role-based team access", "Executive-ready reports", "Priority support"],
  },
];

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Services</span>
          <h2>Choose how NetGuard fits into your workflow</h2>
        </div>
        <div className="grid-3">
          {SERVICES.map((s) => (
            <div className={`tile service-tile ${s.featured ? "is-featured" : ""}`} key={s.name}>
              {s.featured && <span className="service-tile__badge">Most popular</span>}
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
              <ul>
                {s.items.map((item) => (
                  <li key={item}><FiCheck /> {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .service-tile { display: flex; flex-direction: column; position: relative; }
        .service-tile.is-featured { border-color: var(--accent); }
        .service-tile__badge {
          position: absolute; top: -12px; left: 24px;
          background: var(--accent); color: #04120f;
          font-size: 11px; font-weight: 700; padding: 4px 10px;
          border-radius: 999px; letter-spacing: 0.03em;
        }
        .service-tile ul { list-style: none; padding: 0; margin: 18px 0 0; display: flex; flex-direction: column; gap: 10px; }
        .service-tile li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); }
        .service-tile li svg { color: var(--accent); flex-shrink: 0; }
      `}</style>
    </section>
  );
}
