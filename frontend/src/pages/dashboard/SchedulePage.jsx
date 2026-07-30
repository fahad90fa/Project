import { useEffect, useState } from "react";
import { FiClock, FiTrash2, FiPause, FiPlay } from "react-icons/fi";
import api from "../../api/axios.js";
import "./SchedulePage.css";

const PRESETS = [
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at 02:00", value: "0 2 * * *" },
  { label: "Weekly (Mon 03:00)", value: "0 3 * * 1" },
  { label: "Custom…", value: "custom" },
];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [targets, setTargets] = useState("");
  const [preset, setPreset] = useState(PRESETS[1].value);
  const [customCron, setCustomCron] = useState("0 2 * * *");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get("/schedules");
    setSchedules(data.schedules);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cronExpression = preset === "custom" ? customCron : preset;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const targetList = targets.split(",").map((t) => t.trim()).filter(Boolean);
    if (!name.trim() || targetList.length === 0 || !cronExpression.trim()) {
      setError("Name, at least one target, and a schedule are required.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/schedules", { name, targets: targetList, cronExpression });
      setName("");
      setTargets("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create schedule.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (schedule) => {
    await api.patch(`/schedules/${schedule._id}`, { isActive: !schedule.isActive });
    await load();
  };

  const remove = async (id) => {
    await api.delete(`/schedules/${id}`);
    setSchedules((prev) => prev.filter((s) => s._id !== id));
  };

  return (
    <div className="schedule-page">
      <div className="page-head">
        <h2>Scheduled scans</h2>
        <p>Automate recurring recon so drift in your attack surface gets caught between manual runs.</p>
      </div>

      <div className="schedule-grid">
        <form className="panel schedule-form" onSubmit={handleSubmit}>
          <h3>New schedule</h3>
          <label>Name</label>
          <input type="text" placeholder="Weekly DMZ sweep" value={name} onChange={(e) => setName(e.target.value)} />

          <label>Targets</label>
          <input
            type="text"
            placeholder="10.0.4.0/24, example.internal"
            value={targets}
            onChange={(e) => setTargets(e.target.value)}
          />
          <span className="field-hint">Comma-separated IPs, ranges, or hostnames.</span>

          <label>Frequency</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value)}>
            {PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {preset === "custom" && (
            <>
              <input
                type="text"
                className="mono"
                placeholder="0 2 * * *"
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
              />
              <span className="field-hint">Standard 5-field cron expression (minute hour day month weekday).</span>
            </>
          )}

          {error && <div className="auth__error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={saving}>
            <FiClock /> {saving ? "Saving…" : "Create schedule"}
          </button>
        </form>

        <div className="panel schedule-list">
          <h3>Active &amp; paused schedules</h3>
          {loading ? (
            <p className="panel__empty">Loading…</p>
          ) : schedules.length === 0 ? (
            <p className="panel__empty">No schedules yet. Create one to automate recurring scans.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Targets</th>
                  <th>Cron</th>
                  <th>Status</th>
                  <th>Last run</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td className="mono">{s.targets.join(", ")}</td>
                    <td className="mono">{s.cronExpression}</td>
                    <td>
                      <span className={`status-badge ${s.isActive ? "status-badge--ok" : ""}`}>
                        {s.isActive ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td>{s.lastRunAt ? new Date(s.lastRunAt).toLocaleString() : "Never"}</td>
                    <td className="reports-actions">
                      <button className="icon-btn" title={s.isActive ? "Pause" : "Resume"} onClick={() => toggleActive(s)}>
                        {s.isActive ? <FiPause /> : <FiPlay />}
                      </button>
                      <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => remove(s._id)}>
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
