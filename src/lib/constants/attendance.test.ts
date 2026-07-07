import { describe, expect, it } from "vitest";
import { ATTENDANCE_TRACKING_START_DATE, isAttendanceTrackedDate } from "@/lib/constants/attendance";

describe("attendance constants", () => {
  it("tracks attendance from the portal launch date onward", () => {
    expect(ATTENDANCE_TRACKING_START_DATE).toBe("2026-07-07");
    expect(isAttendanceTrackedDate("2026-07-06")).toBe(false);
    expect(isAttendanceTrackedDate("2026-07-07")).toBe(true);
  });
});
