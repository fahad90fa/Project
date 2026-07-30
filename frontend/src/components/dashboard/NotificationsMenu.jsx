import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import api from "../../api/axios.js";

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // fail silently in the topbar — not worth blocking the UI
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (unreadCount > 0) {
      await api.patch("/notifications/read-all");
      setUnreadCount(0);
    }
  };

  return (
    <div className="notif" ref={ref}>
      <button className="notif__bell" onClick={handleOpen} aria-label="Notifications">
        <FiBell size={18} />
        {unreadCount > 0 && <span className="notif__badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif__panel card-glass">
          <div className="notif__panel-head">Notifications</div>
          {notifications.length === 0 ? (
            <div className="notif__empty">Nothing yet — you'll see high-risk findings and scan updates here.</div>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className={`notif__item ${!n.isRead ? "is-unread" : ""}`}>
                <p>{n.message}</p>
                <span>{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .notif { position: relative; }
        .notif__bell { position: relative; background: none; border: none; color: var(--text-muted); display: flex; }
        .notif__bell:hover { color: var(--text); }
        .notif__badge {
          position: absolute; top: -4px; right: -6px; background: var(--risk-critical); color: #fff;
          font-size: 10px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 999px;
          display: flex; align-items: center; justify-content: center; padding: 0 3px;
        }
        .notif__panel {
          position: absolute; right: 0; top: 34px; width: 320px; max-height: 380px; overflow-y: auto;
          padding: 6px 0; z-index: 60;
        }
        .notif__panel-head { padding: 12px 16px; font-size: 13px; font-weight: 700; border-bottom: 1px solid var(--border); }
        .notif__empty { padding: 24px 16px; font-size: 13px; color: var(--text-faint); text-align: center; }
        .notif__item { padding: 12px 16px; border-bottom: 1px solid var(--border); }
        .notif__item:last-child { border-bottom: none; }
        .notif__item.is-unread { background: var(--accent-soft); }
        .notif__item p { font-size: 13px; color: var(--text); margin-bottom: 4px; }
        .notif__item span { font-size: 11px; color: var(--text-faint); }
      `}</style>
    </div>
  );
}
