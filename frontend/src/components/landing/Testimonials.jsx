const QUOTES = [
  {
    quote: "We went from a quarterly spreadsheet audit to knowing about a misconfigured RDP port within minutes of it appearing.",
    name: "Security Operations Lead",
    org: "Mid-size fintech company",
  },
  {
    quote: "The risk scoring did the triage work our team used to do by hand every Monday morning.",
    name: "Director of Infrastructure",
    org: "Regional healthcare network",
  },
  {
    quote: "Scan comparison is the feature I didn't know I needed — it tells me exactly what changed, not just what's there.",
    name: "SOC Analyst",
    org: "Managed services provider",
  },
];

export default function Testimonials() {
  return (
    <section className="section" id="testimonials">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">From security teams</span>
          <h2>What changes when recon stops being a spreadsheet chore</h2>
        </div>
        <div className="testimonial-grid">
          {QUOTES.map((t) => (
            <div className="tile testimonial" key={t.name}>
              <p className="testimonial__quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial__meta">
                <strong>{t.name}</strong>
                <span>{t.org}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .testimonial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .testimonial__quote { font-size: 15px; color: var(--text); line-height: 1.6; margin-bottom: 20px; }
        .testimonial__meta { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
        .testimonial__meta strong { color: var(--text); }
        .testimonial__meta span { color: var(--text-faint); }
        @media (max-width: 860px) { .testimonial-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
