import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["scan_complete", "high_risk_asset", "scan_failed", "system"],
      default: "system",
    },
    message: { type: String, required: true },
    relatedScan: { type: mongoose.Schema.Types.ObjectId, ref: "Scan" },
    relatedAsset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
