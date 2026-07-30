import mongoose from "mongoose";

const scanResultSchema = new mongoose.Schema(
  {
    scan: { type: mongoose.Schema.Types.ObjectId, ref: "Scan", required: true, index: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    ip: { type: String, required: true },
    os: { type: String, default: "Unknown" },
    openPorts: [{ type: Number }],
    services: { type: mongoose.Schema.Types.Mixed, default: {} },
    risk: {
      score: { type: Number, default: 0 },
      level: { type: String, default: "Informational" },
      reasons: [{ type: String }],
    },
  },
  { timestamps: true }
);

export default mongoose.model("ScanResult", scanResultSchema);
