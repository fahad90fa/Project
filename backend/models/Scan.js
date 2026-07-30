import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: String, required: true, index: true },
    targets: [{ type: String, required: true }],
    portRange: {
      start: { type: Number, required: true },
      end: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    scheduledFor: { type: Date },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "ScanSchedule" },
    startedAt: { type: Date },
    completedAt: { type: Date },
    error: { type: String },
    summary: {
      hostsScanned: { type: Number, default: 0 },
      hostsUp: { type: Number, default: 0 },
      openPortsFound: { type: Number, default: 0 },
      criticalAssets: { type: Number, default: 0 },
      highRiskAssets: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Scan", scanSchema);
