// pages/ScanDetailPage.jsx
// Shows full details of a single scan, with export options

import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const ScanDetailPage = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchScan = useCallback(async () => {
    try {
      const { data } = await api.get(`/scans/${id}`);
      setScan(data);
    } catch (err) {
      console.error("Failed to fetch scan", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  useEffect(() => {
    if (!scan) return;
    if (scan.status === "running" || scan.status === "pending") {
      const interval = setInterval(fetchScan, 2500);
      return () => clearInterval(interval);
    }
  }, [scan, fetchScan]);

  const downloadReport = async (format) => {
    const token = localStorage.getItem("netguard-token");
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/scans/${id}/report?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-report.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!scan) return <div className="container">Scan not found.</div>;

  return (
    <div className="container">
      <Link to="/" className="back-link">← Back to Dashboard</Link>
      <h1>Scan Report: {scan.target}</h1>

      <div className="card scan-summary">
        <p><strong>Status:</strong> {scan.status}</p>
        <p><strong>Port Range:</strong> {scan.portRange}</p>
        <p><strong>OS Guess:</strong> {scan.osGuess}</p>
        <p><strong>Risk Score:</strong> {scan.riskScore} ({scan.riskLevel})</p>
        <p><strong>Scanned At:</strong> {new Date(scan.createdAt).toLocaleString()}</p>
        {scan.errorMessage && <p className="alert alert-error">{scan.errorMessage}</p>}

        <div className="report-buttons">
          <button className="btn btn-outline" onClick={() => downloadReport("csv")}>Download CSV</button>
          <button className="btn btn-outline" onClick={() => downloadReport("pdf")}>Download PDF</button>
        </div>
      </div>

      <div className="card">
        <h3>Open Ports ({scan.openPorts?.length || 0})</h3>
        {scan.openPorts && scan.openPorts.length > 0 ? (
          <table className="scan-table">
            <thead>
              <tr>
                <th>Port</th>
                <th>State</th>
                <th>Service</th>
                <th>Banner</th>
              </tr>
            </thead>
            <tbody>
              {scan.openPorts.map((p) => (
                <tr key={p.port}>
                  <td>{p.port}</td>
                  <td>{p.state}</td>
                  <td>{p.service}</td>
                  <td>{p.banner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="hint">
            {scan.status === "running" || scan.status === "pending"
              ? "Scan in progress..."
              : "No open ports found."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ScanDetailPage;
