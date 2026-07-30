import express from "express";
import { body } from "express-validator";
import {
  createSchedule,
  listSchedules,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("admin", "analyst"),
  [
    body("name").notEmpty().withMessage("Schedule name is required"),
    body("targets").isArray({ min: 1 }).withMessage("targets must be a non-empty array"),
    body("cronExpression").notEmpty().withMessage("cronExpression is required"),
  ],
  validate,
  createSchedule
);

router.get("/", listSchedules);
router.patch("/:id", authorize("admin", "analyst"), updateSchedule);
router.delete("/:id", authorize("admin", "analyst"), deleteSchedule);

export default router;
