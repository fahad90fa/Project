import mongoose from "mongoose";

const scanScheduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: String, required: true, index: true },
    targets: [{ type: String, required: true }],
    portRange: {
      start: { type: Number, default: 1 },
      end: { type: Number, default: 1024 },
    },
    osScan: { type: Boolean, default: true },
    // Standard 5-field cron expression, e.g. "0 2 * * *" (daily at 02:00)
    cronExpression: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastRunAt: { type: Date },
    lastRunScan: { type: mongoose.Schema.Types.ObjectId, ref: "Scan" },
    nextRunAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("ScanSchedule", scanScheduleSchema);
