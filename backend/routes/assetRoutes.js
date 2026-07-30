import express from "express";
import { listAssets, getAsset, updateAssetTags } from "../controllers/assetController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", listAssets);
router.get("/:id", getAsset);
router.patch("/:id/tags", updateAssetTags);

export default router;
