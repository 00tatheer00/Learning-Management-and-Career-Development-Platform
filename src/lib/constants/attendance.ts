export const LATE_THRESHOLD_MINUTES = 15;
export const LATE_THRESHOLD_MS = LATE_THRESHOLD_MINUTES * 60 * 1000;
export const ATTENDANCE_GOAL_PERCENT = 80;

/** Portal attendance counts from this date (PKT, YYYY-MM-DD). Earlier classes are not marked absent. */
export const ATTENDANCE_TRACKING_START_DATE = "2026-07-07";

export function lateThresholdDescription(): string {
  return `Late after ${LATE_THRESHOLD_MINUTES} minutes`;
}

export function isAttendanceTrackedDate(date: string): boolean {
  return date >= ATTENDANCE_TRACKING_START_DATE;
}
