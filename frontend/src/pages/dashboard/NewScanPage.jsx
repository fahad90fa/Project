import { useState } from "react";
import { FiRadio, FiCheckCircle, FiXCircle } from "react-icons/fi";
import api from "../../api/axios.js";
import { useScanSocket } from "../../hooks/useScanSocket.js";
import "./NewScanPage.css";

export default function NewScanPage() {
  const [targets, setTargets] = useState("");
  const [startPort, setStartPort] = useState(1);
  const [endPort, setEndPort] = useState(1024);
  const [osScan, setOsScan] = useState(true);
  const [scanId, setScanId] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | running | completed | failed
  const [log, setLog] = useState([]);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  useScanSocket(status === "running" ? scanId : null, {
    onProgress: (event) => {
      setLog((prev) => [formatEvent(event), ...prev].slice(0, 60));
    },
    onComplete: (event) => {
      setStatus("completed");
      setSummary(event.summary);
    },
    onFailed: (event) => {
      setStatus("failed");
      setError(event.error);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSummary(null);
    setLog([]);
    const targetList = targets.split(",").map((t) => t.trim()).filter(Boolean);
    if (targetList.length === 0) {
      setError("Enter at least one target IP or domain.");
      return;
    }
    try {
      const { data } = await api.post("/scans", {
        targets: targetList,
        startPort: Number(startPort),
        endPort: Number(endPort),
        osScan,
      });
      setScanId(data.scanId);
      setStatus("running");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start scan.");
    }
  };

  return (
    <div className="new-scan">
      <div className="page-head">
        <h2>New scan</h2>
        <p>Run an authorized scan against hosts or ranges you own or have permission to test.</p>
      </div>

      <div className="new-scan__grid">
        <form className="panel new-scan__form" onSubmit={handleSubmit}>
          <label>Targets</label>
          <input
            type="text"
            placeholder="10.0.4.0/24, example.internal"
            value={targets}
            onChange={(e) => setTargets(e.target.value)}
            disabled={status === "running"}
          />
          <span className="field-hint">Comma-separated IPs, ranges, or hostnames.</span>

          <div className="new-scan__ports">
            <div>
              <label>Start port</label>
              <input type="number" min={1} max={65535} value={startPort} onChange={(e) => setStartPort(e.target.value)} disabled={status === "running"} />
            </div>
            <div>
              <label>End port</label>
              <input type="number" min={1} max={65535} value={endPort} onChange={(e) => setEndPort(e.target.value)} disabled={status === "running"} />
            </div>
          </div>

          <label className="new-scan__checkbox">
            <input type="checkbox" checked={osScan} onChange={(e) => setOsScan(e.target.checked)} disabled={status === "running"} />
            Include OS fingerprinting
          </label>

          {error && <div className="auth__error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={status === "running"}>
            <FiRadio /> {status === "running" ? "Scanning…" : "Start scan"}
          </button>
        </form>

        <div className="panel new-scan__live">
          <div className="panel__head">
            <h3>Live progress</h3>
            <StatusBadge status={status} />
          </div>

          {summary && (
            <div className="new-scan__summary">
              <SummaryStat label="Hosts up" value={summary.hostsUp} />
              <SummaryStat label="Open ports" value={summary.openPortsFound} />
              <SummaryStat label="Critical" value={summary.criticalAssets} tone="critical" />
              <SummaryStat label="High" value={summary.highRiskAssets} tone="high" />
            </div>
          )}

          <div className="new-scan__log mono">
            {log.length === 0 && status === "idle" && <p className="panel__empty">Start a scan to see live output here.</p>}
            {log.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatEvent(event) {
  const { event: type, data } = event;
  switch (type) {
    case "host_status":
      return `[host] ${data.ip} — ${data.status.toUpperCase()}`;
    case "port_open":
      return `[port]  ${data.ip}:${data.port} OPEN`;
    case "service_detected":
      return `[svc]   ${data.ip}:${data.port} → ${data.banner.slice(0, 40)}`;
    case "os_detected":
      return `[os]    ${data.ip} → ${data.os}`;
    case "scan_progress":
      return `[scan]  ${data.ip} — ${data.scanned}/${data.total} ports checked`;
    case "host_unresolved":
      return `[dns]   ${data.target} could not be resolved`;
    default:
      return `[${type}] ${JSON.stringify(data)}`;
  }
}

function StatusBadge({ status }) {
  if (status === "completed") return <span className="status-badge status-badge--ok"><FiCheckCircle /> Completed</span>;
  if (status === "failed") return <span className="status-badge status-badge--bad"><FiXCircle /> Failed</span>;
  if (status === "running") return <span className="status-badge status-badge--running">Running…</span>;
  return <span className="status-badge">Idle</span>;
}

function SummaryStat({ label, value, tone }) {
  return (
    <div className={`summary-stat ${tone ? `summary-stat--${tone}` : ""}`}>
      <span className="mono summary-stat__value">{value}</span>
      <span className="summary-stat__label">{label}</span>
    </div>
  );
}
