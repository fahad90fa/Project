import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    organization: { type: String, index: true },
    action: { type: String, required: true }, // e.g. "SCAN_STARTED", "LOGIN", "REPORT_EXPORTED"
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
