import Settings from "../models/Settings.js";

// GET /api/settings
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ organization: req.user.organization });
    if (!settings) {
      settings = await Settings.create({ organization: req.user.organization });
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/settings
export const updateSettings = async (req, res, next) => {
  try {
    const { defaultPortRange, scanConcurrencyLimit, notifyOnHighRisk, retentionDays } = req.body;

    const update = {};
    if (defaultPortRange) update.defaultPortRange = defaultPortRange;
    if (scanConcurrencyLimit !== undefined) update.scanConcurrencyLimit = scanConcurrencyLimit;
    if (notifyOnHighRisk !== undefined) update.notifyOnHighRisk = notifyOnHighRisk;
    if (retentionDays !== undefined) update.retentionDays = retentionDays;

    const settings = await Settings.findOneAndUpdate(
      { organization: req.user.organization },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};
