import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import api from "../../api/axios.js";
import "./AssetInventoryPage.css";

const RISK_COLORS = {
  Critical: "#ff4757", High: "#ff9f43", Medium: "#ffd93d", Low: "#4c8dff", Informational: "#6b7684",
};

export default function AssetInventoryPage() {
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(fetchAssets, 300); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, risk, status, page]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/assets", {
        params: { search: search || undefined, risk: risk || undefined, status: status || undefined, page, limit: 10 },
      });
      setAssets(data.assets);
      setPages(data.pages);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assets-page">
      <div className="page-head">
        <h2>Asset inventory</h2>
        <p>{total} discovered {total === 1 ? "asset" : "assets"} across your organization.</p>
      </div>

      <div className="panel">
        <div className="assets-page__toolbar">
          <div className="assets-page__search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by IP, hostname, or OS…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select value={risk} onChange={(e) => { setRisk(e.target.value); setPage(1); }}>
            <option value="">All risk levels</option>
            {["Critical", "High", "Medium", "Low", "Informational"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
          </select>
        </div>

        {loading ? (
          <p className="panel__empty">Loading…</p>
        ) : assets.length === 0 ? (
          <p className="panel__empty">No assets match these filters yet.</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>IP address</th>
                  <th>OS</th>
                  <th>Status</th>
                  <th>Open ports</th>
                  <th>Risk</th>
                  <th>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a._id}>
                    <td className="mono">{a.ip}</td>
                    <td>{a.os}</td>
                    <td>
                      <span className={`status-badge ${a.status === "up" ? "status-badge--ok" : "status-badge--bad"}`}>{a.status}</span>
                    </td>
                    <td className="mono">{a.openPorts?.length ? a.openPorts.join(", ") : "—"}</td>
                    <td>
                      <span className="risk-pill" style={{ color: RISK_COLORS[a.riskLevel], borderColor: RISK_COLORS[a.riskLevel] }}>
                        {a.riskLevel} · {a.riskScore}
                      </span>
                    </td>
                    <td>{new Date(a.lastSeen).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span>Page {page} of {pages}</span>
              <button className="btn btn-ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
