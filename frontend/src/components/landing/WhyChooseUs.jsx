import { FiX, FiCheck } from "react-icons/fi";

const ROWS = [
  { label: "Asset inventory freshness", old: "Updated manually, quarterly at best", new: "Refreshed every scan, automatically" },
  { label: "Risk prioritization", old: "Every open port looks the same in a spreadsheet", new: "Scored Critical → Informational, ranked for you" },
  { label: "Time to insight", old: "Hours parsing raw scan output by hand", new: "Live dashboard the moment a scan completes" },
  { label: "Change detection", old: "No way to tell what changed since last time", new: "Built-in scan comparison flags new & removed hosts" },
];

export default function WhyChooseUs() {
  return (
    <section className="section" id="why-us">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Why choose NetGuard</span>
          <h2>Recon data is only useful if someone can act on it fast</h2>
        </div>
        <div className="why-table">
          <div className="why-table__head">
            <span></span>
            <span>Manual scanning &amp; spreadsheets</span>
            <span>NetGuard</span>
          </div>
          {ROWS.map((r) => (
            <div className="why-table__row" key={r.label}>
              <span className="why-table__label">{r.label}</span>
              <span className="why-table__old"><FiX /> {r.old}</span>
              <span className="why-table__new"><FiCheck /> {r.new}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .why-table { border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
        .why-table__head, .why-table__row {
          display: grid; grid-template-columns: 1fr 1.3fr 1.3fr; gap: 16px;
          padding: 18px 24px; align-items: center;
        }
        .why-table__head {
          font-family: var(--font-mono); font-size: 12px; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--text-faint); background: var(--surface-2);
        }
        .why-table__row { border-top: 1px solid var(--border); }
        .why-table__label { font-weight: 600; font-size: 14.5px; }
        .why-table__old, .why-table__new { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); }
        .why-table__old svg { color: var(--risk-critical); flex-shrink: 0; }
        .why-table__new svg { color: var(--accent); flex-shrink: 0; }
        @media (max-width: 760px) {
          .why-table__head { display: none; }
          .why-table__row { grid-template-columns: 1fr; gap: 6px; }
        }
      `}</style>
    </section>
  );
}
