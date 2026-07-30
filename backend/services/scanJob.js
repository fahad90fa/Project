import Scan from "../models/Scan.js";
import ScanResult from "../models/ScanResult.js";
import Asset from "../models/Asset.js";
import Notification from "../models/Notification.js";
import ActivityLog from "../models/ActivityLog.js";
import { runScan } from "./pythonScanService.js";
import { refineRisk, summarizeRisk } from "../utils/riskEngine.js";

/**
 * Creates a Scan document, kicks off the Python engine, and persists results.
 * Used by both the direct "New Scan" API route and the cron scheduler, so
 * scheduled scans behave identically to manually-triggered ones (same risk
 * scoring, same asset upserts, same notifications, same Socket.IO events).
 *
 * @param {Object} opts
 * @param {string} opts.userId
 * @param {string} opts.organization
 * @param {string[]} opts.targets
 * @param {number} opts.startPort
 * @param {number} opts.endPort
 * @param {boolean} opts.osScan
 * @param {import("socket.io").Server} opts.io
 * @param {string} [opts.scheduleId]
 * @returns {Promise<import("mongoose").Document>} the created Scan document (already responding as "running")
 */
export async function createAndRunScan({
  userId,
  organization,
  targets,
  startPort = 1,
  endPort = 1024,
  osScan = true,
  io,
  scheduleId = null,
}) {
  const scan = await Scan.create({
    createdBy: userId,
    organization,
    targets,
    portRange: { start: startPort, end: endPort },
    status: "running",
    startedAt: new Date(),
    scheduleId: scheduleId || undefined,
  });

  await ActivityLog.create({
    user: userId,
    organization,
    action: scheduleId ? "SCHEDULED_SCAN_STARTED" : "SCAN_STARTED",
    details: { scanId: scan._id, targets, scheduleId },
  });

  const room = `scan:${scan._id}`;
  const emit = (event, payload) => {
    if (io) io.to(room).emit(event, { scanId: scan._id, ...payload });
  };

  runScan({
    targets,
    startPort,
    endPort,
    osScan,
    onProgress: (event) => emit("scan:progress", event),
  })
    .then(async (result) => {
      const scanResults = [];
      for (const hostResult of result.results) {
        const risk = refineRisk(hostResult);
        const asset = await Asset.findOneAndUpdate(
          { ip: hostResult.ip, organization },
          {
            ip: hostResult.ip,
            organization,
            os: hostResult.os,
            status: "up",
            openPorts: hostResult.openPorts,
            services: hostResult.services,
            riskLevel: risk.level,
            riskScore: risk.score,
            riskReasons: risk.reasons,
            lastSeen: new Date(),
            lastScan: scan._id,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const scanResult = await ScanResult.create({
          scan: scan._id,
          asset: asset._id,
          ip: hostResult.ip,
          os: hostResult.os,
          openPorts: hostResult.openPorts,
          services: hostResult.services,
          risk,
        });
        scanResults.push(scanResult);

        if (risk.level === "Critical" || risk.level === "High") {
          await Notification.create({
            user: userId,
            type: "high_risk_asset",
            message: `${risk.level} risk asset detected: ${hostResult.ip} (${risk.score}/100)`,
            relatedScan: scan._id,
            relatedAsset: asset._id,
          });
        }
      }

      const riskSummary = summarizeRisk(scanResults);
      scan.status = "completed";
      scan.completedAt = new Date();
      scan.progress = 100;
      scan.summary = {
        hostsScanned: result.hostsScanned,
        hostsUp: result.hostsUp,
        openPortsFound: scanResults.reduce((sum, r) => sum + r.openPorts.length, 0),
        criticalAssets: riskSummary.Critical || 0,
        highRiskAssets: riskSummary.High || 0,
      };
      await scan.save();

      emit("scan:complete", { summary: scan.summary });
      return scan;
    })
    .catch(async (err) => {
      scan.status = "failed";
      scan.error = err.message;
      await scan.save();
      emit("scan:failed", { error: err.message });
    });

  return scan;
}
