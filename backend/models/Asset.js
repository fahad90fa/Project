import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    hostname: { type: String, default: "" },
    organization: { type: String, required: true, index: true },
    os: { type: String, default: "Unknown" },
    status: { type: String, enum: ["up", "down"], default: "up" },
    openPorts: [{ type: Number }],
    services: { type: mongoose.Schema.Types.Mixed, default: {} },
    riskLevel: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low", "Informational"],
      default: "Informational",
    },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskReasons: [{ type: String }],
    tags: [{ type: String }],
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    lastScan: { type: mongoose.Schema.Types.ObjectId, ref: "Scan" },
  },
  { timestamps: true }
);

assetSchema.index({ ip: 1, organization: 1 }, { unique: true });

export default mongoose.model("Asset", assetSchema);
