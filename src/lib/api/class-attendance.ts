import { prisma } from "@/lib/prisma";
import {
  computeAttendanceMatrix,
  computeAttendanceOverview,
  computeDayRows,
  computeModuleRows,
  computeSessionRows,
  computeStudentAttendanceStats,
  type AttendanceRecordRef,
  type AttendanceSessionRef,
  type AttendanceStudentRef,
} from "@/lib/api/attendance-analytics";
import { parseSessionDateTime } from "@/lib/sessions/join-window";
import { LATE_THRESHOLD_MS } from "@/lib/constants/attendance";

export function getAttendanceStatus(
  sessionDate: string,
  sessionTime: string,
  joinedAt = new Date()
): "present" | "late" {
  const start = parseSessionDateTime(sessionDate, sessionTime);
  if (!start) return "present";
  return joinedAt.getTime() > start.getTime() + LATE_THRESHOLD_MS ? "late" : "present";
}

export async function recordClassJoin(input: {
  sessionId: string;
  studentId: string;
  studentName: string;
  programSlug: string;
  sessionDate: string;
  sessionTime: string;
}): Promise<{ status: "present" | "late"; isNew: boolean }> {
  const existing = await prisma.classAttendance.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: input.sessionId,
        studentId: input.studentId,
      },
    },
  });

  if (existing) {
    return { status: existing.status as "present" | "late", isNew: false };
  }

  const joinedAt = new Date();
  const status = getAttendanceStatus(input.sessionDate, input.sessionTime, joinedAt);

  await prisma.classAttendance.create({
    data: {
      id: crypto.randomUUID(),
      sessionId: input.sessionId,
      studentId: input.studentId,
      studentName: input.studentName,
      programSlug: input.programSlug,
      sessionDate: input.sessionDate,
      sessionTime: input.sessionTime,
      joinedAt,
      status,
    },
  });

  return { status, isNew: true };
}

export interface AttendanceReportRow {
  id: string;
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  programSlug: string;
  studentId: string;
  studentName: string;
  status: "present" | "late";
  joinedAt: string;
}

export async function getAttendanceReport(options?: {
  programSlug?: string;
  sessionId?: string;
  limit?: number;
}): Promise<AttendanceReportRow[]> {
  const records = await prisma.classAttendance.findMany({
    where: {
      ...(options?.programSlug ? { programSlug: options.programSlug } : {}),
      ...(options?.sessionId ? { sessionId: options.sessionId } : {}),
    },
    orderBy: { joinedAt: "desc" },
    take: options?.limit ?? 200,
  });

  if (records.length === 0) return [];

  const sessionIds = [...new Set(records.map((r) => r.sessionId))];
  const sessions = await prisma.liveSession.findMany({
    where: { id: { in: sessionIds } },
    select: { id: true, title: true },
  });
  const titleById = new Map(sessions.map((s) => [s.id, s.title]));

  return records.map((record) => ({
    id: record.id,
    sessionId: record.sessionId,
    sessionTitle: titleById.get(record.sessionId) ?? "Class",
    sessionDate: record.sessionDate,
    sessionTime: record.sessionTime,
    programSlug: record.programSlug,
    studentId: record.studentId,
    studentName: record.studentName,
    status: record.status as "present" | "late",
    joinedAt: record.joinedAt.toISOString(),
  }));
}

export async function getSessionAttendanceSummary(sessionId: string) {
  const records = await prisma.classAttendance.findMany({
    where: { sessionId },
    orderBy: { joinedAt: "asc" },
  });

  return {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    late: records.filter((r) => r.status === "late").length,
    records,
  };
}

function mapAttendanceRecord(record: {
  sessionId: string;
  studentId: string;
  studentName: string;
  status: string;
  joinedAt: Date;
  sessionDate: string;
  sessionTime: string;
}): AttendanceRecordRef {
  return {
    sessionId: record.sessionId,
    studentId: record.studentId,
    studentName: record.studentName,
    status: record.status as "present" | "late",
    joinedAt: record.joinedAt.toISOString(),
    sessionDate: record.sessionDate,
    sessionTime: record.sessionTime,
  };
}

async function loadAttendanceContext(programSlug: string) {
  const [sessions, students, records] = await Promise.all([
    prisma.liveSession.findMany({
      where: { programSlug },
      orderBy: [{ startsAt: "asc" }, { date: "asc" }],
      select: {
        id: true,
        title: true,
        date: true,
        time: true,
        programSlug: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "student", programSlug, isActive: true },
      select: { id: true, name: true, level: true, programSlug: true },
    }),
    prisma.classAttendance.findMany({
      where: { programSlug },
      orderBy: { joinedAt: "desc" },
    }),
  ]);

  return {
    sessions: sessions as AttendanceSessionRef[],
    students: students as AttendanceStudentRef[],
    records: records.map(mapAttendanceRecord),
  };
}

export async function getStudentAttendanceSummary(studentId: string, programSlug: string) {
  const [sessions, records, student] = await Promise.all([
    prisma.liveSession.findMany({
      where: { programSlug },
      select: { id: true, title: true, date: true, time: true, programSlug: true },
    }),
    prisma.classAttendance.findMany({
      where: { studentId, programSlug },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: studentId },
      select: { level: true },
    }),
  ]);

  return computeStudentAttendanceStats({
    studentId,
    programSlug,
    studentLevel: student?.level,
    sessions: sessions as AttendanceSessionRef[],
    records: records.map(mapAttendanceRecord),
  });
}

export async function getProgramAttendanceAnalytics(programSlug: string) {
  const context = await loadAttendanceContext(programSlug);
  const sessionRows = computeSessionRows({ ...context, programSlug });
  const reportRows = await getAttendanceReport({ programSlug, limit: 500 });

  return {
    overview: computeAttendanceOverview({ ...context, programSlug }),
    sessions: sessionRows,
    days: computeDayRows(sessionRows),
    modules: computeModuleRows({ ...context, programSlug }),
    matrix: computeAttendanceMatrix({ ...context, programSlug }),
    rows: reportRows,
  };
}

export async function getTrainerAttendanceAnalytics(programSlug: string, trainerId: string) {
  const context = await loadAttendanceContext(programSlug);

  const sessionIds = new Set(
    (
      await prisma.liveSession.findMany({
        where: { programSlug, trainerId },
        select: { id: true },
      })
    ).map((session) => session.id)
  );

  const filteredSessions = context.sessions.filter((session) => sessionIds.has(session.id));
  const filteredRecords = context.records.filter((record) => sessionIds.has(record.sessionId));
  const filteredContext = {
    sessions: filteredSessions,
    students: context.students,
    records: filteredRecords,
  };

  const sessionRows = computeSessionRows({ ...filteredContext, programSlug });
  const reportRows = (await getAttendanceReport({ programSlug, limit: 500 })).filter((row) =>
    sessionIds.has(row.sessionId)
  );

  return {
    overview: computeAttendanceOverview({ ...filteredContext, programSlug }),
    sessions: sessionRows,
    days: computeDayRows(sessionRows),
    modules: computeModuleRows({ ...filteredContext, programSlug }),
    matrix: computeAttendanceMatrix({ ...filteredContext, programSlug }),
    rows: reportRows,
  };
}
