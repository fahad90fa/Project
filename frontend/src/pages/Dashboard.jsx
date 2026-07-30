// pages/Dashboard.jsx
// Main dashboard: start scans, view scan history, see quick stats

import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import ScanForm from "../components/ScanForm";
import ScanList from "../components/ScanList";
import Charts from "../components/Charts";

const Dashboard = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = useCallback(async () => {
    try {
      const { data } = await api.get("/scans");
      setScans(data);
    } catch (err) {
      console.error("Failed to fetch scans", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  // Poll every 3 seconds while there is at least one running scan,
  // so the dashboard shows live progress without a full page refresh.
  useEffect(() => {
    const hasRunning = scans.some((s) => s.status === "running" || s.status === "pending");
    if (!hasRunning) return;

    const interval = setInterval(fetchScans, 3000);
    return () => clearInterval(interval);
  }, [scans, fetchScans]);

  const handleScanStarted = () => {
    fetchScans();
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/scans/${id}`);
      setScans((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete scan", err);
    }
  };

  return (
    <div className="container">
      <h1>Network Reconnaissance Dashboard</h1>

      <div className="dashboard-grid">
        <ScanForm onScanStarted={handleScanStarted} />
        <Charts scans={scans} />
      </div>

      {loading ? <p>Loading scans...</p> : <ScanList scans={scans} onDelete={handleDelete} />}
    </div>
  );
};

export default Dashboard;
