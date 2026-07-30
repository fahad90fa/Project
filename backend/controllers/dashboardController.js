import Asset from "../models/Asset.js";
import Scan from "../models/Scan.js";
import ActivityLog from "../models/ActivityLog.js";

// GET /api/dashboard/summary
export const getSummary = async (req, res, next) => {
  try {
    const org = req.user.organization;

    const [assets, scans, riskAgg, osAgg, recentScans, recentActivity] = await Promise.all([
      Asset.countDocuments({ organization: org }),
      Scan.countDocuments({ organization: org }),
      Asset.aggregate([
        { $match: { organization: org } },
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      ]),
      Asset.aggregate([
        { $match: { organization: org } },
        { $group: { _id: "$os", count: { $sum: 1 } } },
      ]),
      Scan.find({ organization: org }).sort({ createdAt: -1 }).limit(8),
      ActivityLog.find({ organization: org }).sort({ createdAt: -1 }).limit(10),
    ]);

    const activeHosts = await Asset.countDocuments({ organization: org, status: "up" });
    const offlineHosts = assets - activeHosts;
    const openPortsAgg = await Asset.aggregate([
      { $match: { organization: org } },
      { $project: { portCount: { $size: { $ifNull: ["$openPorts", []] } } } },
      { $group: { _id: null, total: { $sum: "$portCount" } } },
    ]);

    const riskDistribution = { Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0 };
    riskAgg.forEach((r) => { riskDistribution[r._id] = r.count; });

    const avgRisk = riskAgg.length
      ? Math.round(
          (riskDistribution.Critical * 90 + riskDistribution.High * 60 +
            riskDistribution.Medium * 35 + riskDistribution.Low * 10) / (assets || 1)
        )
      : 0;

    const scanTrend = await Scan.aggregate([
      { $match: { organization: org, status: "completed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          scans: { $sum: 1 },
          openPorts: { $sum: "$summary.openPortsFound" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    res.json({
      success: true,
      kpis: {
        totalAssets: assets,
        activeHosts,
        offlineHosts,
        totalScans: scans,
        openPorts: openPortsAgg[0]?.total || 0,
        riskScore: avgRisk,
      },
      riskDistribution,
      osDistribution: osAgg.map((o) => ({ os: o._id || "Unknown", count: o.count })),
      scanTrend: scanTrend.map((s) => ({ date: s._id, scans: s.scans, openPorts: s.openPorts })),
      recentScans,
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/top-risk
export const getTopRisk = async (req, res, next) => {
  try {
    const assets = await Asset.find({ organization: req.user.organization })
      .sort({ riskScore: -1 })
      .limit(5);
    res.json({ success: true, assets });
  } catch (err) {
    next(err);
  }
};
