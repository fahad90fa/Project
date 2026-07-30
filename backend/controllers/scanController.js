import Scan from "../models/Scan.js";
import ScanResult from "../models/ScanResult.js";
import { createAndRunScan } from "../services/scanJob.js";

// POST /api/scans
export const startScan = async (req, res, next) => {
  try {
    const { targets, startPort = 1, endPort = 1024, osScan = true } = req.body;
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({ success: false, message: "targets must be a non-empty array" });
    }

    const io = req.app.get("io");
    const scan = await createAndRunScan({
      userId: req.user._id,
      organization: req.user.organization,
      targets,
      startPort,
      endPort,
      osScan,
      io,
    });

    res.status(202).json({ success: true, scanId: scan._id, status: scan.status });
  } catch (err) {
    next(err);
  }
};

// GET /api/scans
export const listScans = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = { organization: req.user.organization };
    if (req.query.status) filter.status = req.query.status;

    const [scans, total] = await Promise.all([
      Scan.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Scan.countDocuments(filter),
    ]);

    res.json({ success: true, scans, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/scans/:id
export const getScan = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!scan) return res.status(404).json({ success: false, message: "Scan not found" });
    const results = await ScanResult.find({ scan: scan._id });
    res.json({ success: true, scan, results });
  } catch (err) {
    next(err);
  }
};

// GET /api/scans/:id/compare/:otherId
export const compareScan = async (req, res, next) => {
  try {
    const { id, otherId } = req.params;
    const [scanA, scanB] = await Promise.all([
      Scan.findOne({ _id: id, organization: req.user.organization }),
      Scan.findOne({ _id: otherId, organization: req.user.organization }),
    ]);
    if (!scanA || !scanB) {
      return res.status(404).json({ success: false, message: "One or both scans not found" });
    }

    const [a, b] = await Promise.all([
      ScanResult.find({ scan: id }),
      ScanResult.find({ scan: otherId }),
    ]);
    const mapA = new Map(a.map((r) => [r.ip, r]));
    const mapB = new Map(b.map((r) => [r.ip, r]));

    const newHosts = [...mapB.keys()].filter((ip) => !mapA.has(ip));
    const removedHosts = [...mapA.keys()].filter((ip) => !mapB.has(ip));
    const changed = [...mapB.keys()]
      .filter((ip) => mapA.has(ip))
      .map((ip) => ({
        ip,
        portsBefore: mapA.get(ip).openPorts,
        portsAfter: mapB.get(ip).openPorts,
        riskBefore: mapA.get(ip).risk.level,
        riskAfter: mapB.get(ip).risk.level,
      }))
      .filter((c) => JSON.stringify(c.portsBefore) !== JSON.stringify(c.portsAfter) || c.riskBefore !== c.riskAfter);

    res.json({
      success: true,
      scanA: { id: scanA._id, startedAt: scanA.startedAt, summary: scanA.summary },
      scanB: { id: scanB._id, startedAt: scanB.startedAt, summary: scanB.summary },
      newHosts,
      removedHosts,
      changed,
    });
  } catch (err) {
    next(err);
  }
};
