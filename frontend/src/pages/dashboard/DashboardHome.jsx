import { useEffect, useState } from "react";
import {
  FiServer, FiWifi, FiWifiOff, FiRadio, FiShield, FiAlertTriangle,
} from "react-icons/fi";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import api from "../../api/axios.js";
import KpiCard from "../../components/dashboard/KpiCard.jsx";
import "./DashboardHome.css";

const RISK_COLORS = {
  Critical: "#ff4757", High: "#ff9f43", Medium: "#ffd93d", Low: "#4c8dff", Informational: "#6b7684",
};

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [topRisk, setTopRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [summaryRes, topRiskRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/top-risk"),
        ]);
        setData(summaryRes.data);
        setTopRisk(topRiskRes.data.assets);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="dash-loading">Loading dashboard…</div>;
  if (!data) return <EmptyState />;

  const { kpis, riskDistribution, osDistribution, scanTrend, recentActivity } = data;
  const riskPieData = Object.entries(riskDistribution)
    .filter(([, count]) => count > 0)
    .map(([level, count]) => ({ name: level, value: count }));

  return (
    <div className="dashboard-home">
      <div className="dashboard-home__kpis">
        <KpiCard label="Total Assets" value={kpis.totalAssets} icon={<FiServer />} />
        <KpiCard label="Active Hosts" value={kpis.activeHosts} icon={<FiWifi />} tone="accent" />
        <KpiCard label="Offline Hosts" value={kpis.offlineHosts} icon={<FiWifiOff />} />
        <KpiCard label="Total Scans" value={kpis.totalScans} icon={<FiRadio />} />
        <KpiCard label="Open Ports" value={kpis.openPorts} icon={<FiShield />} />
        <KpiCard label="Avg. Risk Score" value={`${kpis.riskScore}/100`} icon={<FiAlertTriangle />} tone={kpis.riskScore >= 50 ? "critical" : "default"} />
      </div>

      <div className="dashboard-home__row">
        <div className="panel panel--wide">
          <div className="panel__head">
            <h3>Scan activity</h3>
            <span>Scans completed &amp; ports found, last 14 runs</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={scanTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-faint)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-faint)" }} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12 }} />
              <Line type="monotone" dataKey="scans" stroke="var(--accent, #00d9b5)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="openPorts" stroke="#4c8dff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel__head">
            <h3>Risk distribution</h3>
            <span>Across all assets</span>
          </div>
          {riskPieData.length === 0 ? (
            <p className="panel__empty">No scans yet — run one to populate risk data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {riskPieData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="risk-legend">
            {Object.entries(riskDistribution).map(([level, count]) => (
              <div key={level} className="risk-legend__item">
                <span style={{ background: RISK_COLORS[level] }} />
                {level}: {count}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-home__row">
        <div className="panel">
          <div className="panel__head">
            <h3>Operating systems</h3>
            <span>Fingerprinted across your inventory</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={osDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="os" tick={{ fontSize: 11, fill: "var(--text-faint)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-faint)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12 }} />
              <Bar dataKey="count" fill="#4c8dff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel__head">
            <h3>Top vulnerable systems</h3>
            <span>Highest risk score right now</span>
          </div>
          <div className="top-risk-list">
            {topRisk.length === 0 && <p className="panel__empty">No assets scanned yet.</p>}
            {topRisk.map((a) => (
              <div key={a._id} className="top-risk-list__item">
                <div>
                  <span className="mono">{a.ip}</span>
                  <span className="top-risk-list__os">{a.os}</span>
                </div>
                <span className="risk-pill" style={{ color: RISK_COLORS[a.riskLevel], borderColor: RISK_COLORS[a.riskLevel] }}>
                  {a.riskLevel} · {a.riskScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel__head">
            <h3>Recent activity</h3>
            <span>Latest actions in your organization</span>
          </div>
          <div className="activity-feed">
            {recentActivity.length === 0 && <p className="panel__empty">No activity logged yet.</p>}
            {recentActivity.map((log) => (
              <div key={log._id} className="activity-feed__item">
                <span className="activity-feed__dot" />
                <div>
                  <span className="mono activity-feed__action">{log.action}</span>
                  <span className="activity-feed__time">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="dashboard-empty">
      <h3>Couldn't load dashboard data</h3>
      <p>Make sure the API server is running and reachable.</p>
    </div>
  );
}
