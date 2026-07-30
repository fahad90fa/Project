import ScanSchedule from "../models/ScanSchedule.js";
import ActivityLog from "../models/ActivityLog.js";
import { scheduleTask, unscheduleTask } from "../services/schedulerService.js";

// POST /api/schedules
export const createSchedule = async (req, res, next) => {
  try {
    const { name, targets, startPort = 1, endPort = 1024, osScan = true, cronExpression } = req.body;
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({ success: false, message: "targets must be a non-empty array" });
    }

    const schedule = await ScanSchedule.create({
      name,
      createdBy: req.user._id,
      organization: req.user.organization,
      targets,
      portRange: { start: startPort, end: endPort },
      osScan,
      cronExpression,
    });

    const io = req.app.get("io");
    scheduleTask(schedule, io);

    await ActivityLog.create({
      user: req.user._id,
      organization: req.user.organization,
      action: "SCHEDULE_CREATED",
      details: { scheduleId: schedule._id, cronExpression },
    });

    res.status(201).json({ success: true, schedule });
  } catch (err) {
    next(err);
  }
};

// GET /api/schedules
export const listSchedules = async (req, res, next) => {
  try {
    const schedules = await ScanSchedule.find({ organization: req.user.organization }).sort({ createdAt: -1 });
    res.json({ success: true, schedules });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/schedules/:id
export const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await ScanSchedule.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    const { name, targets, startPort, endPort, osScan, cronExpression, isActive } = req.body;
    if (name !== undefined) schedule.name = name;
    if (targets !== undefined) schedule.targets = targets;
    if (startPort !== undefined) schedule.portRange.start = startPort;
    if (endPort !== undefined) schedule.portRange.end = endPort;
    if (osScan !== undefined) schedule.osScan = osScan;
    if (cronExpression !== undefined) schedule.cronExpression = cronExpression;
    if (isActive !== undefined) schedule.isActive = isActive;
    await schedule.save();

    const io = req.app.get("io");
    scheduleTask(schedule, io); // re-registers (or unregisters if now inactive)

    res.json({ success: true, schedule });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/schedules/:id
export const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await ScanSchedule.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });
    unscheduleTask(schedule._id.toString());
    res.json({ success: true, message: "Schedule deleted" });
  } catch (err) {
    next(err);
  }
};
