import type { AttendanceCellStatus, StudentDayAttendanceRow } from "@/lib/api/attendance-analytics";
import { ATTENDANCE_GOAL_PERCENT } from "@/lib/constants/attendance";

export function computeAttendanceStreak(days: StudentDayAttendanceRow[]): number {
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;

  for (const day of sorted) {
    if (day.status === "upcoming" || day.status === "untracked") continue;
    if (day.status === "present" || day.status === "late") {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function computeConsecutiveMissed(days: StudentDayAttendanceRow[]): number {
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  let missed = 0;

  for (const day of sorted) {
    if (day.status === "upcoming" || day.status === "untracked") continue;
    if (day.status === "absent") {
      missed += 1;
    } else {
      break;
    }
  }

  return missed;
}

export function getAttendanceGoalMessage(percentage: number): {
  onTrack: boolean;
  goalPercent: number;
  message: string;
} {
  const onTrack = percentage >= ATTENDANCE_GOAL_PERCENT;
  const message = onTrack
    ? `You're on track at ${percentage}% — keep it up!`
    : `You need ${ATTENDANCE_GOAL_PERCENT}% to stay on track (${ATTENDANCE_GOAL_PERCENT - percentage}% to go)`;

  return { onTrack, goalPercent: ATTENDANCE_GOAL_PERCENT, message };
}

export function getAttendanceStatusMeta(status: AttendanceCellStatus): {
  label: string;
  description: string;
} {
  switch (status) {
    case "present":
      return { label: "Present", description: "Joined on time from the portal" };
    case "late":
      return { label: "Late", description: "Joined after the late threshold" };
    case "absent":
      return { label: "Missed", description: "No join recorded for this class" };
    case "upcoming":
      return { label: "Upcoming", description: "Class has not started yet" };
    case "untracked":
      return { label: "Not tracked", description: "Attendance was not tracked for this date" };
  }
}

export function formatHoursUntilClass(startMs: number, nowMs: number): string | null {
  const diffMs = startMs - nowMs;
  if (diffMs <= 0) return null;

  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return days === 1 ? "Tomorrow" : `In ${days} days`;
  }
  if (hours >= 1) {
    return minutes > 0 ? `In ${hours}h ${minutes}m` : `In ${hours} hour${hours === 1 ? "" : "s"}`;
  }
  if (minutes >= 1) return `In ${minutes} min`;
  return "Starting soon";
}
