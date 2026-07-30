import "./landing-shared.css";

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="about__grid">
          <div className="section-head">
            <span className="eyebrow">Why NetGuard exists</span>
            <h2>Most breaches start with an asset nobody remembered to secure</h2>
          </div>
          <div className="about__body">
            <p>
              Spreadsheet inventories go stale the moment a new host joins the network.
              Manual Nmap sweeps take hours to run and longer to interpret. Security teams
              are left making risk decisions on data that's already out of date.
            </p>
            <p>
              NetGuard turns raw reconnaissance data — hosts, ports, services, operating
              systems — into a living, risk-scored asset inventory that updates every time
              you scan. It's the same engine your team already trusts, wrapped in the
              workflow a SOC actually needs: history, comparison, alerting, and reporting.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        .about__grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 48px; }
        .about__body p { font-size: 15.5px; margin-bottom: 18px; }
        @media (max-width: 860px) { .about__grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
