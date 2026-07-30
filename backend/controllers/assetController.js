import Asset from "../models/Asset.js";

// GET /api/assets?search=&risk=&status=&page=&limit=
export const listAssets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, risk, status } = req.query;

    const filter = { organization: req.user.organization };
    if (risk) filter.riskLevel = risk;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { ip: { $regex: search, $options: "i" } },
        { hostname: { $regex: search, $options: "i" } },
        { os: { $regex: search, $options: "i" } },
      ];
    }

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .sort({ riskScore: -1, lastSeen: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Asset.countDocuments(filter),
    ]);

    res.json({ success: true, assets, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
};

// GET /api/assets/:id
export const getAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
    res.json({ success: true, asset });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/assets/:id/tags
export const updateAssetTags = async (req, res, next) => {
  try {
    const { tags } = req.body;
    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      { tags },
      { new: true }
    );
    if (!asset) return res.status(404).json({ success: false, message: "Asset not found" });
    res.json({ success: true, asset });
  } catch (err) {
    next(err);
  }
};
