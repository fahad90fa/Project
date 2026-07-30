import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import api from "../../api/axios.js";
import "./ProfileSettings.css";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [defaultRange, setDefaultRange] = useState({ start: 1, end: 1024 });
  const [notifyHighRisk, setNotifyHighRisk] = useState(true);
  const [retention, setRetention] = useState(90);
  const [concurrency, setConcurrency] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/settings");
        const s = data.settings;
        setDefaultRange(s.defaultPortRange);
        setNotifyHighRisk(s.notifyOnHighRisk);
        setRetention(s.retentionDays);
        setConcurrency(s.scanConcurrencyLimit);
      } catch {
        // fall back to defaults already in state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = await api.patch("/settings", {
        defaultPortRange: { start: Number(defaultRange.start), end: Number(defaultRange.end) },
        notifyOnHighRisk: notifyHighRisk,
        retentionDays: Number(retention),
        scanConcurrencyLimit: Number(concurrency),
      });
      const s = data.settings;
      setDefaultRange(s.defaultPortRange);
      setNotifyHighRisk(s.notifyOnHighRisk);
      setRetention(s.retentionDays);
      setConcurrency(s.scanConcurrencyLimit);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings. You may not have permission to change organization settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-head">
        <h2>Settings</h2>
        <p>Organization-level scan defaults and preferences.</p>
      </div>

      <div className="panel settings-panel">
        <div className="settings-row">
          <div>
            <strong>Appearance</strong>
            <p>Switch between dark and light interface themes.</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={toggleTheme}>
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-field-row">
            <div className="settings-field">
              <label>Default start port</label>
              <input
                type="number"
                disabled={loading}
                value={defaultRange.start}
                onChange={(e) => setDefaultRange({ ...defaultRange, start: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label>Default end port</label>
              <input
                type="number"
                disabled={loading}
                value={defaultRange.end}
                onChange={(e) => setDefaultRange({ ...defaultRange, end: e.target.value })}
              />
            </div>
          </div>

          <div className="settings-field">
            <label>Data retention (days)</label>
            <input type="number" disabled={loading} value={retention} onChange={(e) => setRetention(e.target.value)} />
          </div>

          <div className="settings-field">
            <label>Max concurrent scans</label>
            <input type="number" min={1} max={10} disabled={loading} value={concurrency} onChange={(e) => setConcurrency(e.target.value)} />
          </div>

          <label className="new-scan__checkbox">
            <input
              type="checkbox"
              disabled={loading}
              checked={notifyHighRisk}
              onChange={(e) => setNotifyHighRisk(e.target.checked)}
            />
            Notify me when a Critical or High risk asset is found
          </label>

          {error && <div className="auth__error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={saving || loading}>
            {saving ? "Saving…" : saved ? "Saved" : "Save settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
