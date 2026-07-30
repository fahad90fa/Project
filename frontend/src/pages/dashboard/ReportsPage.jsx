import { useEffect, useState } from "react";
import { FiFileText, FiDownload, FiTrash2, FiFile } from "react-icons/fi";
import api from "../../api/axios.js";
import "./ReportsPage.css";

export default function ReportsPage() {
  const [scans, setScans] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedScan, setSelectedScan] = useState("");
  const [format, setFormat] = useState("pdf");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    const { data } = await api.get("/reports");
    setReports(data.reports);
  };

  useEffect(() => {
    (async () => {
      try {
        const [scanRes] = await Promise.all([api.get("/scans?limit=50"), loadReports()]);
        const completed = scanRes.data.scans.filter((s) => s.status === "completed");
        setScans(completed);
        if (completed.length) setSelectedScan(completed[0]._id);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedScan) {
      setError("Select a completed scan first.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      await api.post(`/reports/${selectedScan}`, { format });
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    const res = await api.get(`/reports/${report._id}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `netguard-report-${report._id}.${report.format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    await api.delete(`/reports/${id}`);
    setReports((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="reports-page">
      <div className="page-head">
        <h2>Reports</h2>
        <p>Export scan findings as PDF or CSV for stakeholders and compliance records.</p>
      </div>

      <div className="reports-grid">
        <form className="panel reports-generate" onSubmit={handleGenerate}>
          <h3>Generate a new report</h3>
          <label>Source scan</label>
          <select value={selectedScan} onChange={(e) => setSelectedScan(e.target.value)} disabled={loading}>
            {scans.length === 0 && <option value="">No completed scans yet</option>}
            {scans.map((s) => (
              <option key={s._id} value={s._id}>
                {s.targets.join(", ")} — {new Date(s.startedAt).toLocaleString()}
              </option>
            ))}
          </select>

          <label>Format</label>
          <div className="reports-format-toggle">
            <button type="button" className={`btn btn-ghost ${format === "pdf" ? "is-selected" : ""}`} onClick={() => setFormat("pdf")}>
              <FiFileText /> PDF
            </button>
            <button type="button" className={`btn btn-ghost ${format === "csv" ? "is-selected" : ""}`} onClick={() => setFormat("csv")}>
              <FiFile /> CSV
            </button>
          </div>

          {error && <div className="auth__error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={generating || !selectedScan}>
            {generating ? "Generating…" : "Generate report"}
          </button>
        </form>

        <div className="panel reports-list">
          <h3>Previous reports</h3>
          {loading ? (
            <p className="panel__empty">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="panel__empty">No reports generated yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Format</th>
                  <th>Generated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td>{r.title}</td>
                    <td className="mono">{r.format.toUpperCase()}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="reports-actions">
                      <button className="icon-btn" title="Download" onClick={() => handleDownload(r)}>
                        <FiDownload />
                      </button>
                      <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => handleDelete(r._id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
