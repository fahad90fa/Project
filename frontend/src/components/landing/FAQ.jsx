import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

const FAQS = [
  { q: "Does NetGuard scan networks I don't own?", a: "No. NetGuard is built for scanning infrastructure you're authorized to assess — your own network ranges, or ranges you have explicit written permission to test. It's an internal asset-intelligence tool, not an internet-wide scanner." },
  { q: "How is the risk score calculated?", a: "Each host is scored on exposed dangerous ports (like RDP, Telnet, or database ports facing the network), whether the OS could be fingerprinted, and overall attack-surface size, then classified from Critical down to Informational." },
  { q: "Can I schedule recurring scans?", a: "Yes — the Continuous Monitoring tier supports scheduled daily or weekly scans, with automatic comparison against the previous run so you see exactly what changed." },
  { q: "What does the scanning engine actually do under the hood?", a: "Host discovery via DNS resolution and liveness checks, concurrent TCP port scanning, lightweight banner-grab service detection, and TTL/TCP-window based OS fingerprinting." },
  { q: "Can I export results for compliance reporting?", a: "Yes, every scan can be exported as a PDF executive report or a raw CSV for further analysis." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>Questions security teams ask before rolling this out</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.q}>
                <button className="faq-item__q" onClick={() => setOpenIndex(isOpen ? -1 : i)} aria-expanded={isOpen}>
                  <span>{item.q}</span>
                  {isOpen ? <FiMinus /> : <FiPlus />}
                </button>
                {isOpen && <p className="faq-item__a">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .faq-list { display: flex; flex-direction: column; border-top: 1px solid var(--border); max-width: 760px; }
        .faq-item { border-bottom: 1px solid var(--border); }
        .faq-item__q {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          background: none; border: none; color: var(--text); font-size: 15.5px; font-weight: 500;
          padding: 20px 4px; text-align: left;
        }
        .faq-item__q svg { color: var(--accent); flex-shrink: 0; }
        .faq-item__a { font-size: 14.5px; padding: 0 4px 20px; max-width: 620px; }
      `}</style>
    </section>
  );
}
