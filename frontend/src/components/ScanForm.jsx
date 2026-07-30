// components/ScanForm.jsx
// Form to start a new network scan

import { useState } from "react";
import api from "../api/axios";

const ScanForm = ({ onScanStarted }) => {
  const [target, setTarget] = useState("");
  const [portRange, setPortRange] = useState("1-1000");
  const [detectOS, setDetectOS] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/scans", { target, portRange, detectOS });
      onScanStarted(data.scanId);
      setTarget("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card scan-form" onSubmit={handleSubmit}>
      <h3>Start a New Scan</h3>
      <p className="hint">
        ⚠️ Only scan hosts/networks you own or are authorized to test.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-row">
        <label>Target (IP or hostname)</label>
        <input
          type="text"
          placeholder="e.g. 127.0.0.1 or scanme.nmap.org"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <label>Port Range</label>
        <input
          type="text"
          placeholder="e.g. 1-1000 or 22,80,443"
          value={portRange}
          onChange={(e) => setPortRange(e.target.value)}
        />
      </div>

      <div className="form-row checkbox-row">
        <label>
          <input
            type="checkbox"
            checked={detectOS}
            onChange={(e) => setDetectOS(e.target.checked)}
          />
          Attempt OS detection (may need admin/root privileges)
        </label>
      </div>

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Starting..." : "Start Scan"}
      </button>
    </form>
  );
};

export default ScanForm;
