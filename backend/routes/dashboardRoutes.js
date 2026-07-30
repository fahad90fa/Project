import express from "express";
import { getSummary, getTopRisk } from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/summary", getSummary);
router.get("/top-risk", getTopRisk);

export default router;
