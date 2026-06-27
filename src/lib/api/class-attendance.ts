import { prisma } from "@/lib/prisma";
import { parseSessionDateTime } from "@/lib/sessions/join-window";

const LATE_THRESHOLD_MS = 10 * 60 * 1000;

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
