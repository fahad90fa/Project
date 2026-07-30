// components/Charts.jsx
// Small dashboard chart summarizing scan statuses using Recharts

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = {
  completed: "#22c55e",
  running: "#3b82f6",
  failed: "#ef4444",
  pending: "#9ca3af",
};

const Charts = ({ scans }) => {
  const counts = scans.reduce((acc, scan) => {
    acc[scan.status] = (acc[scan.status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(counts).map((key) => ({
    name: key,
    value: counts[key],
  }));

  if (data.length === 0) return null;

  return (
    <div className="card">
      <h3>Scan Overview</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#8884d8"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
