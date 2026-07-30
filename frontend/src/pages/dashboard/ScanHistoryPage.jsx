import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import "./ScanHistoryPage.css";

const STATUS_TONE = { completed: "ok", running: "running", queued: "running", failed: "bad" };

export default function ScanHistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/scans");
        setScans(data.scans);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="scan-history">
      <div className="page-head">
        <h2>Scan history</h2>
        <p>Every scan run by your organization, most recent first.</p>
      </div>

      <div className="panel">
        {loading ? (
          <p className="panel__empty">Loading…</p>
        ) : scans.length === 0 ? (
          <p className="panel__empty">
            No scans yet. <Link to="/dashboard/scan">Run your first scan</Link>.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Targets</th>
                <th>Port range</th>
                <th>Status</th>
                <th>Hosts up</th>
                <th>Open ports</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s._id}>
                  <td className="mono">{s.targets.join(", ")}</td>
                  <td className="mono">{s.portRange.start}–{s.portRange.end}</td>
                  <td>
                    <span className={`status-badge status-badge--${STATUS_TONE[s.status] || ""}`}>{s.status}</span>
                  </td>
                  <td>{s.summary?.hostsUp ?? "—"}</td>
                  <td>{s.summary?.openPortsFound ?? "—"}</td>
                  <td>{s.startedAt ? new Date(s.startedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
