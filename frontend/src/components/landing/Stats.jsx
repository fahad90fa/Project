import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: 48000, suffix: "+", label: "Hosts scanned monthly" },
  { value: 1200, suffix: "+", label: "Organizations protected" },
  { value: 92, suffix: "%", label: "Faster time-to-inventory" },
  { value: 24, suffix: "/7", label: "Continuous monitoring" },
];

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

export default function Stats() {
  return (
    <section className="section stats">
      <div className="container stats__grid">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="stats__item"
          >
            <div className="stats__value mono"><Counter value={s.value} suffix={s.suffix} /></div>
            <div className="stats__label">{s.label}</div>
          </motion.div>
        ))}
      </div>
      <style>{`
        .stats { background: var(--surface-2); }
        .stats__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
        .stats__value { font-size: clamp(30px, 3.4vw, 42px); font-weight: 600; color: var(--accent); }
        .stats__label { font-size: 13.5px; color: var(--text-muted); margin-top: 8px; }
        @media (max-width: 760px) { .stats__grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </section>
  );
}
