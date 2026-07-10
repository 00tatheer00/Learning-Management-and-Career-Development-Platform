import { describe, expect, it } from "vitest";
import {
  computeAttendanceStreak,
  computeConsecutiveMissed,
  formatHoursUntilClass,
  getAttendanceGoalMessage,
  getAttendanceStatusMeta,
} from "@/lib/api/attendance-insights";
import type { StudentDayAttendanceRow } from "@/lib/api/attendance-analytics";

const days: StudentDayAttendanceRow[] = [
  {
    date: "2026-07-10",
    dateLabel: "Thu, Jul 10",
    sessions: [],
    status: "absent",
  },
  {
    date: "2026-07-09",
    dateLabel: "Wed, Jul 9",
    sessions: [],
    status: "absent",
  },
  {
    date: "2026-07-08",
    dateLabel: "Tue, Jul 8",
    sessions: [],
    status: "present",
  },
];

describe("attendance insights", () => {
  it("counts attendance streak from most recent tracked days", () => {
    expect(computeAttendanceStreak(days)).toBe(0);
    expect(
      computeAttendanceStreak([
        { date: "2026-07-10", dateLabel: "", sessions: [], status: "present" },
        { date: "2026-07-09", dateLabel: "", sessions: [], status: "late" },
        { date: "2026-07-08", dateLabel: "", sessions: [], status: "absent" },
      ])
    ).toBe(2);
  });

  it("counts consecutive missed classes", () => {
    expect(computeConsecutiveMissed(days)).toBe(2);
  });

  it("describes attendance goal progress", () => {
    expect(getAttendanceGoalMessage(85).onTrack).toBe(true);
    expect(getAttendanceGoalMessage(60).message).toContain("80%");
  });

  it("maps status labels and reasons", () => {
    expect(getAttendanceStatusMeta("absent").label).toBe("Missed");
    expect(getAttendanceStatusMeta("absent").description).toContain("No join recorded");
    expect(getAttendanceStatusMeta("untracked").label).toBe("Not tracked");
  });

  it("formats hours until class", () => {
    const now = Date.parse("2026-07-10T10:00:00.000Z");
    expect(formatHoursUntilClass(now + 2 * 60 * 60 * 1000, now)).toBe("In 2 hours");
  });
});
