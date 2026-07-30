import { useEffect, useState } from "react";
import { FiGitPullRequest, FiPlusCircle, FiMinusCircle, FiAlertTriangle } from "react-icons/fi";
import api from "../../api/axios.js";
import "./ComparePage.css";

export default function ComparePage() {
  const [scans, setScans] = useState([]);
  const [scanA, setScanA] = useState("");
  const [scanB, setScanB] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/scans?limit=50");
        const completed = data.scans.filter((s) => s.status === "completed");
        setScans(completed);
        if (completed.length >= 2) {
          setScanA(completed[1]._id);
          setScanB(completed[0]._id);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCompare = async () => {
    if (!scanA || !scanB || scanA === scanB) {
      setError("Choose two different completed scans.");
      return;
    }
    setError("");
    setComparing(true);
    try {
      const { data } = await api.get(`/scans/${scanA}/compare/${scanB}`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Comparison failed.");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="compare-page">
      <div className="page-head">
        <h2>Compare scans</h2>
        <p>See what changed between two points in time — new hosts, disappeared hosts, and risk drift.</p>
      </div>

      <div className="panel compare-controls">
        <div className="compare-select">
          <label>Baseline (earlier)</label>
          <select value={scanA} onChange={(e) => setScanA(e.target.value)} disabled={loading}>
            <option value="">Select a scan</option>
            {scans.map((s) => (
              <option key={s._id} value={s._id}>{s.targets.join(", ")} — {new Date(s.startedAt).toLocaleString()}</option>
            ))}
          </select>
        </div>
        <div className="compare-select">
          <label>Comparison (later)</label>
          <select value={scanB} onChange={(e) => setScanB(e.target.value)} disabled={loading}>
            <option value="">Select a scan</option>
            {scans.map((s) => (
              <option key={s._id} value={s._id}>{s.targets.join(", ")} — {new Date(s.startedAt).toLocaleString()}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleCompare} disabled={comparing || loading}>
          <FiGitPullRequest /> {comparing ? "Comparing…" : "Compare"}
        </button>
      </div>

      {error && <div className="auth__error compare-error">{error}</div>}

      {result && (
        <div className="compare-results">
          <div className="panel compare-summary">
            <SummaryChip icon={<FiPlusCircle />} tone="ok" label="New hosts" value={result.newHosts.length} />
            <SummaryChip icon={<FiMinusCircle />} tone="bad" label="Removed hosts" value={result.removedHosts.length} />
            <SummaryChip icon={<FiAlertTriangle />} tone="running" label="Changed hosts" value={result.changed.length} />
          </div>

          {result.newHosts.length > 0 && (
            <div className="panel">
              <h3>New hosts</h3>
              <div className="compare-chip-list">
                {result.newHosts.map((ip) => <span key={ip} className="mono compare-chip compare-chip--ok">{ip}</span>)}
              </div>
            </div>
          )}

          {result.removedHosts.length > 0 && (
            <div className="panel">
              <h3>Removed hosts</h3>
              <div className="compare-chip-list">
                {result.removedHosts.map((ip) => <span key={ip} className="mono compare-chip compare-chip--bad">{ip}</span>)}
              </div>
            </div>
          )}

          <div className="panel">
            <h3>Changed hosts</h3>
            {result.changed.length === 0 ? (
              <p className="panel__empty">No port or risk changes on hosts present in both scans.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Host</th>
                    <th>Ports before</th>
                    <th>Ports after</th>
                    <th>Risk before</th>
                    <th>Risk after</th>
                  </tr>
                </thead>
                <tbody>
                  {result.changed.map((c) => (
                    <tr key={c.ip}>
                      <td className="mono">{c.ip}</td>
                      <td className="mono">{c.portsBefore.join(", ") || "—"}</td>
                      <td className="mono">{c.portsAfter.join(", ") || "—"}</td>
                      <td><span className="status-badge">{c.riskBefore}</span></td>
                      <td><span className="status-badge">{c.riskAfter}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryChip({ icon, tone, label, value }) {
  return (
    <div className={`compare-summary-chip compare-summary-chip--${tone}`}>
      {icon}
      <div>
        <span className="mono compare-summary-chip__value">{value}</span>
        <span className="compare-summary-chip__label">{label}</span>
      </div>
    </div>
  );
}
