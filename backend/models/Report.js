import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    scan: { type: mongoose.Schema.Types.ObjectId, ref: "Scan", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: String, required: true, index: true },
    format: { type: String, enum: ["pdf", "csv"], required: true },
    filePath: { type: String, required: true },
    summary: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
