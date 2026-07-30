import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const register = async (req, res, next) => {
  try {
    const { name, email, password, organization } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const user = await User.create({ name, email, password, organization });
    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    user.lastLogin = new Date();
    await user.save();
    await ActivityLog.create({
      user: user._id,
      organization: user.organization,
      action: "LOGIN",
      ipAddress: req.ip,
    });
    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization, theme: user.theme },
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};
