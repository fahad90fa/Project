import express from "express";
import { body } from "express-validator";
import { startScan, listScans, getScan, compareScan } from "../controllers/scanController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("admin", "analyst"),
  [
    body("targets").isArray({ min: 1 }).withMessage("targets must be a non-empty array"),
    body("startPort").optional().isInt({ min: 1, max: 65535 }),
    body("endPort").optional().isInt({ min: 1, max: 65535 }),
  ],
  validate,
  startScan
);

router.get("/", listScans);
router.get("/:id", getScan);
router.get("/:id/compare/:otherId", compareScan);

export default router;
