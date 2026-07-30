export default function KpiCard({ label, value, icon, tone = "default", sub }) {
  return (
    <div className={`kpi kpi--${tone}`}>
      <div className="kpi__top">
        <span className="kpi__label">{label}</span>
        <span className="kpi__icon">{icon}</span>
      </div>
      <div className="kpi__value mono">{value}</div>
      {sub && <div className="kpi__sub">{sub}</div>}

      <style>{`
        .kpi {
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md);
          padding: 20px; display: flex; flex-direction: column; gap: 10px;
        }
        .kpi__top { display: flex; align-items: center; justify-content: space-between; }
        .kpi__label { font-size: 12.5px; color: var(--text-muted); font-weight: 500; }
        .kpi__icon { color: var(--text-faint); font-size: 16px; }
        .kpi__value { font-size: 26px; font-weight: 600; color: var(--text); }
        .kpi__sub { font-size: 11.5px; color: var(--text-faint); }
        .kpi--critical .kpi__value { color: var(--risk-critical); }
        .kpi--accent .kpi__value { color: var(--accent); }
      `}</style>
    </div>
  );
}
