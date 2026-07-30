import cron from "node-cron";
import ScanSchedule from "../models/ScanSchedule.js";
import { createAndRunScan } from "./scanJob.js";

// Map of scheduleId -> cron task, so we can stop/replace tasks when a
// schedule is updated, deleted, or toggled inactive without restarting
// the whole server.
const activeTasks = new Map();

async function runSchedule(schedule, io) {
  try {
    const scan = await createAndRunScan({
      userId: schedule.createdBy,
      organization: schedule.organization,
      targets: schedule.targets,
      startPort: schedule.portRange?.start ?? 1,
      endPort: schedule.portRange?.end ?? 1024,
      osScan: schedule.osScan,
      io,
      scheduleId: schedule._id,
    });
    schedule.lastRunAt = new Date();
    schedule.lastRunScan = scan._id;
    await schedule.save();
  } catch (err) {
    console.error(`[SCHEDULER] Failed to run schedule ${schedule._id}:`, err.message);
  }
}

export function scheduleTask(schedule, io) {
  unscheduleTask(schedule._id.toString());
  if (!schedule.isActive) return;
  if (!cron.validate(schedule.cronExpression)) {
    console.error(`[SCHEDULER] Invalid cron expression for schedule ${schedule._id}: ${schedule.cronExpression}`);
    return;
  }
  const task = cron.schedule(schedule.cronExpression, () => runSchedule(schedule, io));
  activeTasks.set(schedule._id.toString(), task);
}

export function unscheduleTask(scheduleId) {
  const existing = activeTasks.get(scheduleId);
  if (existing) {
    existing.stop();
    activeTasks.delete(scheduleId);
  }
}

/**
 * Loads all active schedules from the database and registers cron tasks
 * for each. Call once at server startup.
 */
export async function initScheduler(io) {
  const schedules = await ScanSchedule.find({ isActive: true });
  for (const schedule of schedules) {
    scheduleTask(schedule, io);
  }
  console.log(`[SCHEDULER] Loaded ${schedules.length} active scan schedule(s)`);
}
