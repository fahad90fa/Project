// components/ScanList.jsx
// Displays a table of past scans belonging to the logged-in user

import { Link } from "react-router-dom";

const statusColors = {
  pending: "badge-gray",
  running: "badge-blue",
  completed: "badge-green",
  failed: "badge-red",
};

const ScanList = ({ scans, onDelete }) => {
  if (scans.length === 0) {
    return <p className="hint">No scans yet. Start your first scan above.</p>;
  }

  return (
    <div className="card">
      <h3>Scan History</h3>
      <table className="scan-table">
        <thead>
          <tr>
            <th>Target</th>
            <th>Ports</th>
            <th>Status</th>
            <th>Risk</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan._id}>
              <td>
                <Link to={`/scans/${scan._id}`}>{scan.target}</Link>
              </td>
              <td>{scan.portRange}</td>
              <td>
                <span className={`badge ${statusColors[scan.status]}`}>{scan.status}</span>
              </td>
              <td>{scan.riskScore ?? 0}</td>
              <td>{new Date(scan.createdAt).toLocaleString()}</td>
              <td>
                <button className="btn btn-outline btn-sm" onClick={() => onDelete(scan._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScanList;
