import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    organization: { type: String, required: true, unique: true },
    defaultPortRange: {
      start: { type: Number, default: 1 },
      end: { type: Number, default: 1024 },
    },
    scanConcurrencyLimit: { type: Number, default: 2 },
    notifyOnHighRisk: { type: Boolean, default: true },
    retentionDays: { type: Number, default: 90 },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
