import express from "express";
import { body } from "express-validator";
import { updateMe } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router.patch(
  "/me",
  [body("name").optional().notEmpty().withMessage("Name cannot be empty")],
  validate,
  updateMe
);

export default router;
