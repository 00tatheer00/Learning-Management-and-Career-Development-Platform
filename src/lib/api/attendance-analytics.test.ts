import { describe, expect, it } from "vitest";
import {
  buildAttendanceLookup,
  computeAttendanceOverview,
  computeDayRows,
  computeModuleRows,
  computeSessionRows,
  computeStudentAttendanceStats,
  filterPastSessions,
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
  const now = new Date("2026-07-07T16:00:00.000Z"); // class 1 done, class 2 today

  it("detects past sessions", () => {
    expect(isSessionPast("2026-07-06", "10:00 PM", now)).toBe(true);
    expect(isSessionPast("2026-07-08", "10:00 PM", now)).toBe(false);
    expect(filterPastSessions(sessions, now).map((session) => session.id)).toEqual(["s1"]);
  });

  it("computes student attendance percentage", () => {
    const stats = computeStudentAttendanceStats({
      studentId: "stu1",
      programSlug: "web-development",
      studentLevel: "HTML & CSS",
      sessions,
      records,
      now,
    });

    expect(stats.attended).toBe(2);
    expect(stats.present).toBe(2);
    expect(stats.late).toBe(0);
    expect(stats.percentage).toBeGreaterThan(0);
  });

  it("builds session rows with absent counts for eligible students", () => {
    const rows = computeSessionRows({
      sessions,
      students,
      records,
      programSlug: "web-development",
      now,
    });

    const class1 = rows.find((row) => row.sessionId === "s1");
    expect(class1?.present).toBe(1);
    expect(class1?.late).toBe(1);
    expect(class1?.absent).toBe(0);
    expect(class1?.expected).toBe(2);
  });

  it("groups sessions by day", () => {
    const dayRows = computeDayRows(
      computeSessionRows({
        sessions,
        students,
        records,
        programSlug: "web-development",
        now,
      })
    );

    expect(dayRows[0]?.date).toBe("2026-07-06");
    expect(dayRows[0]?.present).toBe(1);
    expect(dayRows[0]?.late).toBe(1);
  });

  it("computes module-wise attendance", () => {
    const moduleRows = computeModuleRows({
      sessions,
      students,
      records,
      programSlug: "web-development",
      now,
    });

    const module1 = moduleRows.find((row) => row.moduleName === "HTML & CSS");
    expect(module1?.studentCount).toBe(2);
    expect(module1?.present).toBeGreaterThan(0);
  });

  it("computes overview totals", () => {
    const overview = computeAttendanceOverview({
      sessions,
      students,
      records,
      programSlug: "web-development",
      now,
    });

    expect(overview.eligibleStudents).toBe(2);
    expect(overview.pastSessions).toBe(1);
    expect(overview.present + overview.late).toBe(2);
  });

  it("computes student day-by-day attendance", () => {
    const stats = computeStudentAttendanceStats({
      studentId: "stu1",
      programSlug: "web-development",
      studentLevel: "HTML & CSS",
      sessions,
      records,
      now,
    });

    expect(stats.days.length).toBeGreaterThan(0);
    const class1Day = stats.days.find((day) => day.date === "2026-07-06");
    expect(class1Day?.status).toBe("present");
    const class2Day = stats.days.find((day) => day.date === "2026-07-07");
    expect(class2Day?.status).toBe("present");
  });

  it("builds attendance lookup map", () => {
    const lookup = buildAttendanceLookup(records);
    expect(lookup.get("s1:stu1")?.status).toBe("present");
  });
});
