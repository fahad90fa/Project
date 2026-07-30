import { useEffect, useState } from "react";
import "./ScanVisual.css";

// Fixed layout so the sweep/node timing can be choreographed deliberately.
const NODES = [
  { id: "n1", x: 120, y: 70, ip: "10.0.4.12", risk: "low" },
  { id: "n2", x: 230, y: 40, ip: "10.0.4.18", risk: "medium" },
  { id: "n3", x: 300, y: 130, ip: "10.0.4.21", risk: "critical" },
  { id: "n4", x: 190, y: 170, ip: "10.0.4.33", risk: "low" },
  { id: "n5", x: 90, y: 190, ip: "10.0.4.45", risk: "high" },
  { id: "n6", x: 260, y: 220, ip: "10.0.4.51", risk: "low" },
  { id: "n7", x: 40, y: 120, ip: "10.0.4.60", risk: "medium" },
];

const LINKS = [
  ["n1", "n2"], ["n2", "n3"], ["n1", "n7"], ["n7", "n5"],
  ["n5", "n4"], ["n4", "n6"], ["n3", "n6"], ["n1", "n4"],
];

const TICKER_LINES = [
  { text: "10.0.4.12  →  22/tcp OPEN   ssh", tone: "low" },
  { text: "10.0.4.18  →  445/tcp OPEN  smb", tone: "medium" },
  { text: "10.0.4.21  →  3389/tcp OPEN rdp", tone: "critical" },
  { text: "10.0.4.21  →  risk: CRITICAL (82/100)", tone: "critical" },
  { text: "10.0.4.45  →  21/tcp OPEN   ftp", tone: "high" },
  { text: "10.0.4.60  →  OS: Linux (ttl=64)", tone: "medium" },
];

const CENTER = { x: 170, y: 130 };

export default function ScanVisual() {
  const [visibleLines, setVisibleLines] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((v) => (v >= TICKER_LINES.length ? 1 : v + 1));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="scan-visual card-glass">
      <div className="scan-visual__graph">
        <svg viewBox="0 0 340 260" className="scan-visual__svg">
          <defs>
            <radialGradient id="sweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* connections */}
          {LINKS.map(([a, b], i) => {
            const na = NODES.find((n) => n.id === a);
            const nb = NODES.find((n) => n.id === b);
            return (
              <line
                key={i}
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke="var(--border-strong)" strokeWidth="1"
              />
            );
          })}

          {/* radar sweep */}
          <g className="scan-visual__sweep-group" style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}>
            <path
              d={`M ${CENTER.x} ${CENTER.y} L ${CENTER.x + 140} ${CENTER.y} A 140 140 0 0 0 ${CENTER.x + 99} ${CENTER.y - 99} Z`}
              fill="url(#sweepGradient)"
            />
          </g>
          <circle cx={CENTER.x} cy={CENTER.y} r="140" fill="none" stroke="var(--border)" strokeDasharray="2 6" />

          {/* nodes */}
          {NODES.map((n, i) => (
            <g key={n.id} className="scan-visual__node" style={{ animationDelay: `${i * 0.35}s` }}>
              <circle cx={n.x} cy={n.y} r="10" fill="var(--surface)" stroke={`var(--risk-${n.risk})`} strokeWidth="2" />
              <circle cx={n.x} cy={n.y} r="3.2" fill={`var(--risk-${n.risk})`} />
            </g>
          ))}
        </svg>
      </div>

      <div className="scan-visual__ticker mono">
        <div className="scan-visual__ticker-head">
          <span className="scan-visual__dot" />
          <span className="scan-visual__dot" />
          <span className="scan-visual__dot" />
          <span className="scan-visual__ticker-label">live_scan.log</span>
        </div>
        {TICKER_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={`scan-visual__ticker-line tone-${line.tone}`}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
