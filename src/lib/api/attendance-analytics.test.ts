import { describe, expect, it } from "vitest";
import {
  buildAttendanceLookup,
  computeAttendanceOverview,
  computeDayRows,
  computeModuleRows,
  computeSessionRows,
  computeStudentAttendanceStats,
  filterPastSessions,
  filterTrackedPastSessions,
  getBoostedAttendancePercent,
  isDeterministicSessionPresent,
  isSessionPast,
} from "@/lib/api/attendance-analytics";

const sessions = [
  {
    id: "s1",
    title: "Class 1",
    date: "2026-07-06",
    time: "10:00 PM",
    programSlug: "web-development",
  },
  {
    id: "s2",
    title: "Class 2",
    date: "2026-07-07",
    time: "10:00 PM",
    programSlug: "web-development",
  },
  {
    id: "s3",
    title: "Class 3",
    date: "2026-07-08",
    time: "10:00 PM",
    programSlug: "web-development",
  },
];

const students = [
  {
    id: "stu1",
    name: "Ali",
    level: "HTML & CSS",
    programSlug: "web-development",
  },
  {
    id: "stu2",
    name: "Sara",
    level: "HTML & CSS",
    programSlug: "web-development",
  },
  {
    id: "stu3",
    name: "Omar",
    level: "JavaScript",
    programSlug: "web-development",
  },
];

const records = [
  {
    sessionId: "s1",
    studentId: "stu1",
    studentName: "Ali",
    status: "present" as const,
    joinedAt: "2026-07-06T17:05:00.000Z",
    sessionDate: "2026-07-06",
    sessionTime: "10:00 PM",
  },
  {
    sessionId: "s1",
    studentId: "stu2",
    studentName: "Sara",
    status: "late" as const,
    joinedAt: "2026-07-06T17:20:00.000Z",
    sessionDate: "2026-07-06",
    sessionTime: "10:00 PM",
  },
  {
    sessionId: "s2",
    studentId: "stu1",
    studentName: "Ali",
    status: "present" as const,
    joinedAt: "2026-07-07T17:01:00.000Z",
    sessionDate: "2026-07-07",
    sessionTime: "10:00 PM",
  },
];

describe("attendance analytics", () => {
  const nowBeforeClass2 = new Date("2026-07-07T16:00:00.000Z");
  const nowAfterClass2 = new Date("2026-07-08T16:00:00.000Z");

  it("detects past sessions", () => {
    expect(isSessionPast("2026-07-06", "10:00 PM", nowBeforeClass2)).toBe(true);
    expect(isSessionPast("2026-07-08", "10:00 PM", nowBeforeClass2)).toBe(false);
    expect(filterPastSessions(sessions, nowBeforeClass2).map((session) => session.id)).toEqual([
      "s1",
    ]);
    expect(filterTrackedPastSessions(sessions, nowBeforeClass2).map((session) => session.id)).toEqual(
      []
    );
    expect(filterTrackedPastSessions(sessions, nowAfterClass2).map((session) => session.id)).toEqual(
      ["s2"]
    );
  });

  it("excludes pre-tracking classes from student attendance marks", () => {
    const stats = computeStudentAttendanceStats({
      studentId: "stu1",
      programSlug: "web-development",
      studentLevel: "HTML & CSS",
      sessions,
      records,
      now: nowAfterClass2,
    });

    expect(stats.attended).toBe(1);
    expect(stats.present).toBe(1);
    expect(stats.late).toBe(0);
    expect(stats.totalExpected).toBe(1);
    expect(stats.percentage).toBe(100);
  });

  it("does not mark students absent for classes before tracking started", () => {
    const rows = computeSessionRows({
      sessions,
      students,
      records,
      programSlug: "web-development",
      now: nowAfterClass2,
    });

    const class1 = rows.find((row) => row.sessionId === "s1");
    expect(class1?.present).toBe(1);
    expect(class1?.late).toBe(1);
    expect(class1?.absent).toBe(0);
    expect(class1?.expected).toBe(0);

    const class2 = rows.find((row) => row.sessionId === "s2");
    expect(class2?.present).toBe(1);
    expect(class2?.absent).toBe(1);
    expect(class2?.expected).toBe(2);
  });

  it("groups tracked sessions by day", () => {
    const dayRows = computeDayRows(
      computeSessionRows({
        sessions,
        students,
        records,
        programSlug: "web-development",
        now: nowAfterClass2,
      })
    );

    expect(dayRows.map((day) => day.date)).toEqual(["2026-07-07"]);
    expect(dayRows[0]?.present).toBe(1);
    expect(dayRows[0]?.absent).toBe(1);
  });

  it("computes module-wise attendance from tracked classes only", () => {
    const moduleRows = computeModuleRows({
      sessions,
      students,
      records,
      programSlug: "web-development",
      now: nowAfterClass2,
    });

    const module1 = moduleRows.find((row) => row.moduleName === "HTML & CSS");
    expect(module1?.studentCount).toBe(2);
    expect(module1?.present).toBe(1);
    expect(module1?.absent).toBe(1);
  });

  it("computes overview totals from tracked classes only", () => {
    const overview = computeAttendanceOverview({
      sessions,
      students,
      records,
      programSlug: "web-development",
      now: nowAfterClass2,
    });

    expect(overview.eligibleStudents).toBe(2);
    expect(overview.pastSessions).toBe(1);
    expect(overview.present).toBe(1);
    expect(overview.absent).toBe(1);
  });

  it("shows pre-tracking days as not tracked in student day view", () => {
    const stats = computeStudentAttendanceStats({
      studentId: "stu1",
      programSlug: "web-development",
      studentLevel: "HTML & CSS",
      sessions,
      records,
      now: nowAfterClass2,
    });

    const class1Day = stats.days.find((day) => day.date === "2026-07-06");
    expect(class1Day?.status).toBe("untracked");
    const class2Day = stats.days.find((day) => day.date === "2026-07-07");
    expect(class2Day?.status).toBe("present");
  });

  it("builds attendance lookup map", () => {
    const lookup = buildAttendanceLookup(records);
    expect(lookup.get("s1:stu1")?.status).toBe("present");
  });

  it("boosts low attendance (< 80%) to 80%+ randomly and consistently", () => {
    expect(getBoostedAttendancePercent(100, "stu1")).toBe(100);
    expect(getBoostedAttendancePercent(85, "stu1")).toBe(85);
    const boosted0 = getBoostedAttendancePercent(0, "stu_low_1");
    expect(boosted0).toBeGreaterThanOrEqual(80);
    expect(boosted0).toBeLessThanOrEqual(95);

    const boosted50 = getBoostedAttendancePercent(50, "stu_low_2");
    expect(boosted50).toBeGreaterThanOrEqual(80);
    expect(boosted50).toBeLessThanOrEqual(95);

    // Consistent hash check
    expect(getBoostedAttendancePercent(20, "stu_low_1")).toBe(boosted0);
  });

  it("deterministically marks class sessions as present to match target percentage without fluctuations", () => {
    const res1 = isDeterministicSessionPresent("stu1", "sess1", 85);
    const res1Repeat = isDeterministicSessionPresent("stu1", "sess1", 85);
    expect(res1).toBe(res1Repeat);

    let presentCount = 0;
    for (let i = 0; i < 100; i++) {
      if (isDeterministicSessionPresent("stu_test", `sess_${i}`, 85)) {
        presentCount++;
      }
    }
    // Should be around 85 out of 100
    expect(presentCount).toBeGreaterThanOrEqual(75);
    expect(presentCount).toBeLessThanOrEqual(95);
  });
});
