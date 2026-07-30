import express from "express";
import { generateReport, listReports, downloadReport, deleteReport } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", listReports);
router.post("/:scanId", generateReport);
router.get("/:id/download", downloadReport);
router.delete("/:id", deleteReport);

export default router;
