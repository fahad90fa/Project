import "./landing-shared.css";

const STEPS = [
  { n: "01", title: "Discover", desc: "Enter IP ranges or domains. NetGuard resolves and verifies which hosts are actually live." },
  { n: "02", title: "Scan", desc: "Ports, services, and OS fingerprints are gathered concurrently, with progress streamed live." },
  { n: "03", title: "Score", desc: "Every finding runs through the risk engine and lands in your persistent asset inventory." },
  { n: "04", title: "Report", desc: "Compare against the last scan, clear alerts, and export a report your CISO can read in five minutes." },
];

export default function PlatformOverview() {
  return (
    <section className="section" id="platform">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>One pipeline, from raw packets to a risk-scored inventory</h2>
        </div>
        <div className="grid-4">
          {STEPS.map((s) => (
            <div className="tile" key={s.n}>
              <span className="step-marker">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
