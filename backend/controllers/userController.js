import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

// PATCH /api/users/me
export const updateMe = async (req, res, next) => {
  try {
    const { name, avatarUrl, theme } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
    if (theme !== undefined && ["dark", "light"].includes(theme)) update.theme = theme;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true });

    await ActivityLog.create({
      user: user._id,
      organization: user.organization,
      action: "PROFILE_UPDATED",
      details: update,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        avatarUrl: user.avatarUrl,
        theme: user.theme,
      },
    });
  } catch (err) {
    next(err);
  }
};
