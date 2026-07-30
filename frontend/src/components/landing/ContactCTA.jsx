import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";

export default function ContactCTA() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="section contact" id="contact">
      <div className="container contact__grid">
        <div>
          <span className="eyebrow">Talk to us</span>
          <h2>Ready to see your real attack surface?</h2>
          <p className="contact__sub">
            Tell us about your environment and we'll set up a walkthrough scan on a
            range you choose — no commitment required.
          </p>
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          {submitted ? (
            <div className="contact__success">Thanks — we'll be in touch within one business day.</div>
          ) : (
            <>
              <div className="contact__row">
                <input type="text" placeholder="Full name" required />
                <input type="email" placeholder="Work email" required />
              </div>
              <input type="text" placeholder="Company" required />
              <textarea placeholder="What would you like to scan or monitor?" rows={4} />
              <button type="submit" className="btn btn-primary">
                Request a walkthrough <FiArrowRight />
              </button>
            </>
          )}
        </form>
      </div>
      <style>{`
        .contact { border-bottom: none; }
        .contact__grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 56px; align-items: start; }
        .contact h2 { margin-top: 10px; font-size: clamp(28px, 3.2vw, 38px); }
        .contact__sub { margin-top: 16px; font-size: 15px; max-width: 380px; }
        .contact__form { display: flex; flex-direction: column; gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 28px; }
        .contact__row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .contact__form input, .contact__form textarea {
          background: var(--bg-elevated); border: 1px solid var(--border-strong); border-radius: var(--radius-sm);
          padding: 12px 14px; color: var(--text); font-family: var(--font-body); font-size: 14px; resize: vertical;
        }
        .contact__form input:focus, .contact__form textarea:focus { outline: none; border-color: var(--accent); }
        .contact__form button { align-self: flex-start; margin-top: 4px; }
        .contact__success { padding: 20px; text-align: center; color: var(--accent); font-weight: 600; }
        @media (max-width: 860px) { .contact__grid, .contact__row { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
