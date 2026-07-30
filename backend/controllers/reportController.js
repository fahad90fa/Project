import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { Parser as CsvParser } from "json2csv";
import Scan from "../models/Scan.js";
import ScanResult from "../models/ScanResult.js";
import Report from "../models/Report.js";
import ActivityLog from "../models/ActivityLog.js";

const OUTPUT_DIR = path.resolve(process.cwd(), process.env.REPORTS_DIR || "reports_output");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function safeFileName(str) {
  return str.replace(/[^a-zA-Z0-9-_]/g, "_");
}

async function buildPdf(scan, results, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).fillColor("#0A0E13").text("NetGuard Scan Report", { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#555").text(`Generated ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(12).fillColor("#000").text(`Targets: ${scan.targets.join(", ")}`);
    doc.text(`Port range: ${scan.portRange.start}-${scan.portRange.end}`);
    doc.text(`Status: ${scan.status}`);
    doc.text(`Started: ${scan.startedAt ? new Date(scan.startedAt).toLocaleString() : "-"}`);
    doc.text(`Completed: ${scan.completedAt ? new Date(scan.completedAt).toLocaleString() : "-"}`);
    doc.moveDown();

    doc.fontSize(14).text("Summary", { underline: true });
    doc.fontSize(11).moveDown(0.3);
    const s = scan.summary || {};
    doc.text(`Hosts scanned: ${s.hostsScanned ?? 0}`);
    doc.text(`Hosts up: ${s.hostsUp ?? 0}`);
    doc.text(`Open ports found: ${s.openPortsFound ?? 0}`);
    doc.text(`Critical risk assets: ${s.criticalAssets ?? 0}`);
    doc.text(`High risk assets: ${s.highRiskAssets ?? 0}`);
    doc.moveDown();

    doc.fontSize(14).text("Host Findings", { underline: true });
    doc.moveDown(0.5);

    results.forEach((r, idx) => {
      if (doc.y > 700) doc.addPage();
      doc.fontSize(12).fillColor("#0A0E13").text(`${idx + 1}. ${r.ip}  —  ${r.risk.level} (${r.risk.score}/100)`);
      doc.fontSize(10).fillColor("#333");
      doc.text(`   OS: ${r.os || "Unknown"}`);
      doc.text(`   Open ports: ${r.openPorts.length ? r.openPorts.join(", ") : "None"}`);
      if (r.risk.reasons?.length) {
        doc.text(`   Risk factors: ${r.risk.reasons.join("; ")}`);
      }
      doc.moveDown(0.6);
    });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function buildCsv(results) {
  const rows = results.map((r) => ({
    ip: r.ip,
    os: r.os,
    openPorts: r.openPorts.join(" | "),
    riskLevel: r.risk.level,
    riskScore: r.risk.score,
    riskReasons: r.risk.reasons?.join(" | ") || "",
  }));
  const parser = new CsvParser({
    fields: ["ip", "os", "openPorts", "riskLevel", "riskScore", "riskReasons"],
  });
  return parser.parse(rows);
}

// POST /api/reports/:scanId  { format: "pdf" | "csv" }
export const generateReport = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const format = (req.body.format || "pdf").toLowerCase();
    if (!["pdf", "csv"].includes(format)) {
      return res.status(400).json({ success: false, message: "format must be 'pdf' or 'csv'" });
    }

    const scan = await Scan.findOne({ _id: scanId, organization: req.user.organization });
    if (!scan) return res.status(404).json({ success: false, message: "Scan not found" });

    const results = await ScanResult.find({ scan: scan._id });
    const stamp = Date.now();
    const baseName = safeFileName(`netguard-report-${scan._id}-${stamp}`);
    const fileName = `${baseName}.${format}`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    if (format === "pdf") {
      await buildPdf(scan, results, filePath);
    } else {
      fs.writeFileSync(filePath, buildCsv(results));
    }

    const report = await Report.create({
      title: `Scan report — ${scan.targets.join(", ")}`,
      scan: scan._id,
      createdBy: req.user._id,
      organization: req.user.organization,
      format,
      filePath: fileName, // store relative name only, resolve against OUTPUT_DIR on download
      summary: scan.summary,
    });

    await ActivityLog.create({
      user: req.user._id,
      organization: req.user.organization,
      action: "REPORT_EXPORTED",
      details: { reportId: report._id, scanId: scan._id, format },
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports
export const listReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ organization: req.user.organization })
      .sort({ createdAt: -1 })
      .populate("scan", "targets startedAt")
      .populate("createdBy", "name email");
    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/:id/download
export const downloadReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    const filePath = path.join(OUTPUT_DIR, path.basename(report.filePath));
    if (!fs.existsSync(filePath)) {
      return res.status(410).json({ success: false, message: "Report file no longer available" });
    }
    res.download(filePath, path.basename(filePath));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reports/:id
export const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    const filePath = path.join(OUTPUT_DIR, path.basename(report.filePath));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, message: "Report deleted" });
  } catch (err) {
    next(err);
  }
};
