import "server-only";

import { prisma } from "@/lib/prisma";
import {
  computeAttendanceMatrix,
  computeAttendanceOverview,
  computeDayRows,
  computeModuleRows,
  computeSessionRows,
  computeStudentAttendanceStats,
  getEligibleStudents,
  type AttendanceCellStatus,
  type AttendanceRecordRef,
  type AttendanceSessionRef,
  type AttendanceStudentRef,
} from "@/lib/api/attendance-analytics";
import { parseSessionDateTime } from "@/lib/sessions/join-window";
import { LATE_THRESHOLD_MS, ATTENDANCE_GOAL_PERCENT } from "@/lib/constants/attendance";

export interface AttendanceAnalyticsFilters {
  programSlug: string;
  dateFrom?: string;
  dateTo?: string;
  batch?: string;
  lowAttendanceOnly?: boolean;
  recordsPage?: number;
  recordsPageSize?: number;
}

export interface AttendanceRecordsPage {
  rows: AttendanceReportRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SessionAttendanceDetail {
  sessionId: string;
  title: string;
  date: string;
  time: string;
  eligibleCount: number;
  joinedCount: number;
  present: number;
  late: number;
  absent: number;
  students: Array<{
    studentId: string;
    studentName: string;
    batch: string | null;
    module: string | null;
    status: AttendanceCellStatus;
    joinedAt: string | null;
    markSource: string | null;
    markedBy: string | null;
  }>;
}

export interface PreClassAttendanceAlert {
  sessionId: string;
  title: string;
  date: string;
  time: string;
  eligibleCount: number;
  joinedCount: number;
  phase: "starting_soon" | "live";
}

export interface LowAttendanceStudent {
  studentId: string;
  studentName: string;
  module: string;
  batch: string | null;
  rate: number;
  attended: number;
  missed: number;
}

function isWithinDateRange(date: string, from?: string, to?: string): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function filterStudentsByBatch(
  students: AttendanceStudentRef[],
  batch?: string
): AttendanceStudentRef[] {
  if (!batch || batch === "all") return students;
  return students.filter((student) => (student.batch ?? "Batch 1") === batch);
}

function applyLowAttendanceFilter<T extends { rate: number }>(
  rows: T[],
  enabled?: boolean
): T[] {
  if (!enabled) return rows;
  return rows.filter((row) => row.rate < ATTENDANCE_GOAL_PERCENT);
}

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
      markSource: "portal_join",
    },
  });

  return { status, isNew: true };
}

export async function manualSetStudentAttendance(input: {
  sessionId: string;
  studentId: string;
  status: "present" | "late" | "absent";
  markedBy: string;
  adminNote?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await prisma.liveSession.findUnique({
    where: { id: input.sessionId },
    select: {
      id: true,
      programSlug: true,
      date: true,
      time: true,
      trainerId: true,
    },
  });

  if (!session) {
    return { ok: false, error: "Class session not found." };
  }

  const student = await prisma.user.findFirst({
    where: { id: input.studentId, role: "student", isActive: true },
    select: { id: true, name: true, programSlug: true },
  });

  if (!student) {
    return { ok: false, error: "Student not found." };
  }

  if (student.programSlug !== session.programSlug) {
    return { ok: false, error: "Student is not in this course." };
  }

  if (input.status === "absent") {
    await prisma.classAttendance.deleteMany({
      where: {
        sessionId: input.sessionId,
        studentId: input.studentId,
      },
    });
    return { ok: true };
  }

  const joinedAt = new Date();
  const note = input.adminNote?.trim() || null;

  await prisma.classAttendance.upsert({
    where: {
      sessionId_studentId: {
        sessionId: input.sessionId,
        studentId: input.studentId,
      },
    },
    create: {
      id: crypto.randomUUID(),
      sessionId: input.sessionId,
      studentId: input.studentId,
      studentName: student.name,
      programSlug: session.programSlug,
      sessionDate: session.date,
      sessionTime: session.time,
      joinedAt,
      status: input.status,
      markSource: "manual",
      markedBy: input.markedBy,
      adminNote: note,
    },
    update: {
      studentName: student.name,
      status: input.status,
      joinedAt,
      markSource: "manual",
      markedBy: input.markedBy,
      adminNote: note,
    },
  });

  return { ok: true };
}

export async function assertTrainerOwnsSession(
  sessionId: string,
  trainerId: string
): Promise<{ ok: true; programSlug: string } | { ok: false; error: string }> {
  const session = await prisma.liveSession.findFirst({
    where: { id: sessionId, trainerId },
    select: { programSlug: true },
  });

  if (!session) {
    return { ok: false, error: "You can only manage attendance for your own classes." };
  }

  return { ok: true, programSlug: session.programSlug };
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
  dateFrom?: string;
  dateTo?: string;
  studentIds?: string[];
  limit?: number;
  offset?: number;
}): Promise<AttendanceReportRow[]> {
  const records = await prisma.classAttendance.findMany({
    where: {
      ...(options?.programSlug ? { programSlug: options.programSlug } : {}),
      ...(options?.sessionId ? { sessionId: options.sessionId } : {}),
      ...(options?.studentIds?.length ? { studentId: { in: options.studentIds } } : {}),
      ...(options?.dateFrom || options?.dateTo
        ? {
            sessionDate: {
              ...(options.dateFrom ? { gte: options.dateFrom } : {}),
              ...(options.dateTo ? { lte: options.dateTo } : {}),
            },
          }
        : {}),
    },
    orderBy: { joinedAt: "desc" },
    take: options?.limit ?? 500,
    ...(options?.offset != null ? { skip: options.offset } : {}),
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

export async function countAttendanceReport(options?: {
  programSlug?: string;
  dateFrom?: string;
  dateTo?: string;
  studentIds?: string[];
}): Promise<number> {
  return prisma.classAttendance.count({
    where: {
      ...(options?.programSlug ? { programSlug: options.programSlug } : {}),
      ...(options?.studentIds?.length ? { studentId: { in: options.studentIds } } : {}),
      ...(options?.dateFrom || options?.dateTo
        ? {
            sessionDate: {
              ...(options.dateFrom ? { gte: options.dateFrom } : {}),
              ...(options.dateTo ? { lte: options.dateTo } : {}),
            },
          }
        : {}),
    },
  });
}

export async function getAttendanceRecordsPage(
  filters: AttendanceAnalyticsFilters
): Promise<AttendanceRecordsPage> {
  const pageSize = Math.min(Math.max(filters.recordsPageSize ?? 25, 10), 100);
  const page = Math.max(filters.recordsPage ?? 1, 1);
  const context = await loadAttendanceContext(filters.programSlug);
  const students = filterStudentsByBatch(context.students, filters.batch);
  const studentIds = students.map((student) => student.id);

  const total = await countAttendanceReport({
    programSlug: filters.programSlug,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    studentIds: filters.batch && filters.batch !== "all" ? studentIds : undefined,
  });

  const rows = await getAttendanceReport({
    programSlug: filters.programSlug,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    studentIds: filters.batch && filters.batch !== "all" ? studentIds : undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
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
      select: {
        id: true,
        name: true,
        level: true,
        programSlug: true,
        email: true,
        batch: true,
      },
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

export async function getAvailableAttendanceBatches(programSlug: string): Promise<string[]> {
  const students = await prisma.user.findMany({
    where: { role: "student", programSlug, isActive: true },
    select: { batch: true },
  });
  const batches = new Set(students.map((student) => student.batch ?? "Batch 1"));
  return [...batches].sort((a, b) => a.localeCompare(b));
}

function buildFilteredContext(
  context: Awaited<ReturnType<typeof loadAttendanceContext>>,
  filters: AttendanceAnalyticsFilters
) {
  const students = filterStudentsByBatch(context.students, filters.batch);
  const studentIds = new Set(students.map((student) => student.id));
  const sessions = context.sessions.filter((session) =>
    isWithinDateRange(session.date, filters.dateFrom, filters.dateTo)
  );
  const sessionIds = new Set(sessions.map((session) => session.id));
  const records = context.records.filter(
    (record) =>
      studentIds.has(record.studentId) &&
      sessionIds.has(record.sessionId) &&
      isWithinDateRange(record.sessionDate, filters.dateFrom, filters.dateTo)
  );

  return { sessions, students, records };
}

export async function getSessionAttendanceDetail(
  sessionId: string,
  programSlug: string,
  batch?: string
): Promise<SessionAttendanceDetail | null> {
  const session = await prisma.liveSession.findFirst({
    where: { id: sessionId, programSlug },
    select: { id: true, title: true, date: true, time: true },
  });
  if (!session) return null;

  const context = await loadAttendanceContext(programSlug);
  const students = filterStudentsByBatch(
    getEligibleStudents(context.students, programSlug),
    batch
  );
  const records = await prisma.classAttendance.findMany({
    where: { sessionId },
    orderBy: { joinedAt: "asc" },
  });
  const recordByStudent = new Map(records.map((record) => [record.studentId, record]));

  const studentRows = students.map((student) => {
    const record = recordByStudent.get(student.id);
    return {
      studentId: student.id,
      studentName: student.name,
      batch: student.batch ?? "Batch 1",
      module: student.level ?? null,
      status: (record?.status ?? "absent") as AttendanceCellStatus,
      joinedAt: record?.joinedAt.toISOString() ?? null,
      markSource: record?.markSource ?? null,
      markedBy: record?.markedBy ?? null,
    };
  });

  const present = studentRows.filter((row) => row.status === "present").length;
  const late = studentRows.filter((row) => row.status === "late").length;

  return {
    sessionId: session.id,
    title: session.title,
    date: session.date,
    time: session.time,
    eligibleCount: students.length,
    joinedCount: present + late,
    present,
    late,
    absent: Math.max(0, students.length - present - late),
    students: studentRows.sort((a, b) => a.studentName.localeCompare(b.studentName)),
  };
}

export async function getPreClassAttendanceAlerts(
  programSlug: string,
  now = new Date()
): Promise<PreClassAttendanceAlert[]> {
  const context = await loadAttendanceContext(programSlug);
  const eligible = getEligibleStudents(context.students, programSlug);
  const alerts: PreClassAttendanceAlert[] = [];

  for (const session of context.sessions) {
    const start = parseSessionDateTime(session.date, session.time);
    if (!start) continue;

    const msUntilStart = start.getTime() - now.getTime();
    const isLive = msUntilStart <= 0 && msUntilStart > -60 * 60 * 1000;
    const isStartingSoon = msUntilStart > 0 && msUntilStart <= 2 * 60 * 60 * 1000;
    if (!isLive && !isStartingSoon) continue;

    const joinedCount = context.records.filter((record) => record.sessionId === session.id).length;

    alerts.push({
      sessionId: session.id,
      title: session.title,
      date: session.date,
      time: session.time,
      eligibleCount: eligible.length,
      joinedCount,
      phase: isLive ? "live" : "starting_soon",
    });
  }

  return alerts.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

export function getLowAttendanceStudents(
  matrix: { students: Array<{ studentId: string; studentName: string; module: string; rate: number; attended: number; missed: number }> },
  students: AttendanceStudentRef[],
  limit = 5
): LowAttendanceStudent[] {
  const batchById = new Map(students.map((student) => [student.id, student.batch ?? "Batch 1"]));

  return matrix.students
    .filter((student) => student.rate < ATTENDANCE_GOAL_PERCENT && student.attended + student.missed > 0)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, limit)
    .map((student) => ({
      studentId: student.studentId,
      studentName: student.studentName,
      module: student.module,
      batch: batchById.get(student.studentId) ?? null,
      rate: student.rate,
      attended: student.attended,
      missed: student.missed,
    }));
}

async function buildProgramAttendanceAnalytics(filters: AttendanceAnalyticsFilters) {
  const context = await loadAttendanceContext(filters.programSlug);
  const filtered = buildFilteredContext(context, filters);
  const { programSlug } = filters;

  const sessionRows = computeSessionRows({ ...filtered, programSlug });
  const matrix = computeAttendanceMatrix({ ...filtered, programSlug });
  const modules = computeModuleRows({ ...filtered, programSlug }).map((module) => ({
    ...module,
    students: applyLowAttendanceFilter(module.students, filters.lowAttendanceOnly),
  }));

  const recordsPage = await getAttendanceRecordsPage(filters);
  const batches = await getAvailableAttendanceBatches(programSlug);

  return {
    overview: computeAttendanceOverview({ ...filtered, programSlug }),
    sessions: sessionRows,
    days: computeDayRows(sessionRows),
    modules: filters.lowAttendanceOnly
      ? modules.filter((module) => module.students.length > 0)
      : modules,
    matrix: {
      ...matrix,
      students: applyLowAttendanceFilter(matrix.students, filters.lowAttendanceOnly),
    },
    records: recordsPage,
    batches,
    preClassAlerts: await getPreClassAttendanceAlerts(programSlug),
    lowAttendanceStudents: getLowAttendanceStudents(matrix, filtered.students),
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
      select: { level: true, email: true },
    }),
  ]);

  return computeStudentAttendanceStats({
    studentId,
    programSlug,
    studentLevel: student?.level,
    studentEmail: student?.email,
    sessions: sessions as AttendanceSessionRef[],
    records: records.map(mapAttendanceRecord),
  });
}

export async function getProgramAttendanceAnalytics(filters: AttendanceAnalyticsFilters) {
  return buildProgramAttendanceAnalytics(filters);
}

export async function getTrainerAttendanceAnalytics(
  programSlug: string,
  trainerId: string,
  filters?: Pick<AttendanceAnalyticsFilters, "batch" | "dateFrom" | "dateTo" | "lowAttendanceOnly">
) {
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
  const filteredContext = buildFilteredContext(
    {
      sessions: filteredSessions,
      students: context.students,
      records: filteredRecords,
    },
    {
      programSlug,
      batch: filters?.batch,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
      lowAttendanceOnly: filters?.lowAttendanceOnly,
    }
  );

  const sessionRows = computeSessionRows({ ...filteredContext, programSlug });
  const matrix = computeAttendanceMatrix({ ...filteredContext, programSlug });
  const modules = computeModuleRows({ ...filteredContext, programSlug }).map((module) => ({
    ...module,
    students: applyLowAttendanceFilter(module.students, filters?.lowAttendanceOnly),
  }));

  return {
    overview: computeAttendanceOverview({ ...filteredContext, programSlug }),
    sessions: sessionRows,
    days: computeDayRows(sessionRows),
    modules: filters?.lowAttendanceOnly
      ? modules.filter((module) => module.students.length > 0)
      : modules,
    matrix: {
      ...matrix,
      students: applyLowAttendanceFilter(matrix.students, filters?.lowAttendanceOnly),
    },
    records: await getAttendanceRecordsPage({
      programSlug,
      batch: filters?.batch,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
      recordsPage: 1,
      recordsPageSize: 25,
    }),
    batches: await getAvailableAttendanceBatches(programSlug),
    preClassAlerts: (await getPreClassAttendanceAlerts(programSlug)).filter((alert) =>
      sessionIds.has(alert.sessionId)
    ),
    lowAttendanceStudents: getLowAttendanceStudents(matrix, filteredContext.students),
  };
}
