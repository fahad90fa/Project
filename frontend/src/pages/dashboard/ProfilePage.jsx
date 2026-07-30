import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";
import "./ProfileSettings.css";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", { name: name.trim() });
      refreshUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-head">
        <h2>Profile</h2>
        <p>Manage your personal account details.</p>
      </div>

      <div className="panel settings-panel">
        <div className="profile-avatar-row">
          <div className="dash__avatar profile-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-field">
            <label>Full name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="settings-field">
            <label>Email</label>
            <input type="email" value={user?.email || ""} disabled />
          </div>
          <div className="settings-field">
            <label>Organization</label>
            <input type="text" value={user?.organization || ""} disabled />
          </div>
          <div className="settings-field">
            <label>Role</label>
            <input type="text" value={user?.role || ""} disabled />
          </div>

          {error && <div className="auth__error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
