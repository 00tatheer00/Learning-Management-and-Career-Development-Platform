import { generateClassSlots } from "@/lib/class-schedule";
import { canAccessModuleOneClasses } from "@/lib/modules/student-module-access";
import { groupStudentsByModule } from "@/lib/trainer/group-students-by-module";
import { parseSessionDateTime } from "@/lib/sessions/live-session-datetime";
import { formatYmdInPakistan, getTodayYmdInPakistan } from "@/lib/utils/pakistan-time";
import { isAttendanceTrackedDate } from "@/lib/constants/attendance";

export type AttendanceCellStatus = "present" | "late" | "absent" | "upcoming" | "untracked";

export interface AttendanceSessionRef {
  id: string;
  title: string;
  date: string;
  time: string;
  programSlug: string;
}

export interface AttendanceStudentRef {
  id: string;
  name: string;
  level?: string | null;
  programSlug?: string | null;
  email?: string | null;
}

export interface AttendanceRecordRef {
  sessionId: string;
  studentId: string;
  studentName: string;
  status: "present" | "late";
  joinedAt: string;
  sessionDate: string;
  sessionTime: string;
}

export interface StudentAttendanceStats {
  attended: number;
  present: number;
  late: number;
  missed: number;
  totalExpected: number;
  percentage: number;
  records: Array<{
    sessionId: string;
    sessionTitle: string;
    sessionDate: string;
    sessionTime: string;
    status: "present" | "late";
    joinedAt: string;
  }>;
  days: StudentDayAttendanceRow[];
}

export interface StudentDaySessionItem {
  sessionId?: string;
  title: string;
  time: string;
  classNumber?: number;
  status: AttendanceCellStatus;
  joinedAt?: string;
}

export interface StudentDayAttendanceRow {
  date: string;
  dateLabel: string;
  classNumber?: number;
  sessions: StudentDaySessionItem[];
  status: AttendanceCellStatus;
}

export interface SessionAttendanceRow {
  sessionId: string;
  title: string;
  date: string;
  time: string;
  isPast: boolean;
  present: number;
  late: number;
  absent: number;
  expected: number;
  rate: number;
}

export interface DayAttendanceRow {
  date: string;
  dateLabel: string;
  sessions: SessionAttendanceRow[];
  present: number;
  late: number;
  absent: number;
  expected: number;
  rate: number;
}

export interface ModuleStudentAttendance {
  studentId: string;
  studentName: string;
  attended: number;
  present: number;
  late: number;
  missed: number;
  totalExpected: number;
  rate: number;
}

export interface ModuleAttendanceRow {
  moduleName: string;
  studentCount: number;
  present: number;
  late: number;
  absent: number;
  expected: number;
  rate: number;
  students: ModuleStudentAttendance[];
}

export interface AttendanceOverview {
  totalStudents: number;
  eligibleStudents: number;
  pastSessions: number;
  totalMarks: number;
  present: number;
  late: number;
  absent: number;
  rate: number;
}

export interface AttendanceMatrixStudent {
  studentId: string;
  studentName: string;
  module: string;
  cells: Record<string, AttendanceCellStatus>;
  attended: number;
  missed: number;
  rate: number;
}

export interface AttendanceMatrix {
  sessions: AttendanceSessionRef[];
  students: AttendanceMatrixStudent[];
}

export function isSessionPast(
  date: string,
  time: string,
  now: Date = new Date(),
  timezone = "Asia/Karachi"
): boolean {
  const start = parseSessionDateTime(date, time, timezone);
  if (start) return start.getTime() <= now.getTime();
  const today = getTodayYmdInPakistan(now);
  return date < today;
}

export function filterPastSessions<T extends Pick<AttendanceSessionRef, "date" | "time">>(
  sessions: T[],
  now: Date = new Date()
): T[] {
  return sessions.filter((session) => isSessionPast(session.date, session.time, now));
}

export function filterTrackedPastSessions<T extends Pick<AttendanceSessionRef, "date" | "time">>(
  sessions: T[],
  now: Date = new Date()
): T[] {
  return filterPastSessions(sessions, now).filter((session) =>
    isAttendanceTrackedDate(session.date)
  );
}

function getTrackedScheduleCompletedCount(programSlug: string, now: Date): number {
  return generateClassSlots(programSlug, { now, maxClasses: 36 }).filter(
    (slot) => slot.status === "done" && isAttendanceTrackedDate(slot.date)
  ).length;
}

export function getEligibleStudents(
  students: AttendanceStudentRef[],
  programSlug: string
): AttendanceStudentRef[] {
  return students.filter(
    (student) =>
      student.programSlug === programSlug &&
      canAccessModuleOneClasses(programSlug, student.level, undefined, student.email)
  );
}

function attendanceKey(sessionId: string, studentId: string): string {
  return `${sessionId}:${studentId}`;
}

export function buildAttendanceLookup(records: AttendanceRecordRef[]): Map<string, AttendanceRecordRef> {
  const map = new Map<string, AttendanceRecordRef>();
  for (const record of records) {
    map.set(attendanceKey(record.sessionId, record.studentId), record);
  }
  return map;
}

export function getSessionTitle(sessionId: string, sessions: AttendanceSessionRef[]): string {
  return sessions.find((session) => session.id === sessionId)?.title ?? "Class";
}

export function computeStudentAttendanceStats(input: {
  studentId: string;
  programSlug: string;
  studentLevel?: string | null;
  studentEmail?: string | null;
  sessions: AttendanceSessionRef[];
  records: AttendanceRecordRef[];
  now?: Date;
}): StudentAttendanceStats {
  const now = input.now ?? new Date();
  const eligible = canAccessModuleOneClasses(
    input.programSlug,
    input.studentLevel,
    undefined,
    input.studentEmail
  );
  const pastSessions = filterTrackedPastSessions(
    input.sessions.filter((session) => session.programSlug === input.programSlug),
    now
  );

  const studentRecords = input.records
    .filter(
      (record) =>
        record.studentId === input.studentId && isAttendanceTrackedDate(record.sessionDate)
    )
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));

  const present = studentRecords.filter((record) => record.status === "present").length;
  const late = studentRecords.filter((record) => record.status === "late").length;
  const attended = studentRecords.length;

  const scheduleFallback = getTrackedScheduleCompletedCount(input.programSlug, now);
  const totalExpected = eligible
    ? Math.max(pastSessions.length, scheduleFallback > 0 ? scheduleFallback : pastSessions.length)
    : 0;

  const missed = eligible ? Math.max(0, totalExpected - attended) : 0;
  const percentage =
    eligible && totalExpected > 0 ? Math.round((attended / totalExpected) * 100) : 0;

  return {
    attended,
    present,
    late,
    missed,
    totalExpected,
    percentage: Math.min(100, percentage),
    records: studentRecords.map((record) => ({
      sessionId: record.sessionId,
      sessionTitle: getSessionTitle(record.sessionId, input.sessions),
      sessionDate: record.sessionDate,
      sessionTime: record.sessionTime,
      status: record.status,
      joinedAt: record.joinedAt,
    })),
    days: computeStudentDayRows({
      ...input,
      studentEmail: input.studentEmail,
    }),
  };
}

export function computeStudentDayRows(input: {
  programSlug: string;
  studentId: string;
  studentLevel?: string | null;
  studentEmail?: string | null;
  sessions: AttendanceSessionRef[];
  records: AttendanceRecordRef[];
  now?: Date;
}): StudentDayAttendanceRow[] {
  if (
    !canAccessModuleOneClasses(
      input.programSlug,
      input.studentLevel,
      undefined,
      input.studentEmail
    )
  ) {
    return [];
  }

  const now = input.now ?? new Date();
  const lookup = buildAttendanceLookup(input.records);
  const programSessions = input.sessions.filter(
    (session) => session.programSlug === input.programSlug
  );

  const sessionsByDate = new Map<string, AttendanceSessionRef[]>();
  for (const session of programSessions) {
    const list = sessionsByDate.get(session.date) ?? [];
    list.push(session);
    sessionsByDate.set(session.date, list);
  }

  const slots = generateClassSlots(input.programSlug, { now, maxClasses: 36 });
  const dayMap = new Map<string, StudentDayAttendanceRow>();

  for (const slot of slots) {
    if (slot.status === "upcoming") continue;

    const dateSessions = sessionsByDate.get(slot.date) ?? [];
    const items: StudentDaySessionItem[] = [];

    if (dateSessions.length > 0) {
      for (const session of dateSessions) {
        const record = lookup.get(attendanceKey(session.id, input.studentId));
        const past = isSessionPast(session.date, session.time, now);
        items.push({
          sessionId: session.id,
          title: session.title,
          time: session.time,
          classNumber: slot.classNumber,
          status: record
            ? isAttendanceTrackedDate(session.date)
              ? record.status
              : "untracked"
            : past
              ? isAttendanceTrackedDate(session.date)
                ? "absent"
                : "untracked"
              : "upcoming",
          joinedAt: record?.joinedAt,
        });
      }
    } else if (slot.status === "done") {
      items.push({
        title: `Class ${slot.classNumber}`,
        time: slot.timeLabel,
        classNumber: slot.classNumber,
        status: isAttendanceTrackedDate(slot.date) ? "absent" : "untracked",
      });
    } else {
      items.push({
        title: `Class ${slot.classNumber}`,
        time: slot.timeLabel,
        classNumber: slot.classNumber,
        status: "upcoming",
      });
    }

    dayMap.set(slot.date, {
      date: slot.date,
      dateLabel: formatYmdInPakistan(slot.date, { weekday: true, month: "short" }),
      classNumber: slot.classNumber,
      sessions: items,
      status: rollupDayStatus(items),
    });
  }

  for (const [date, dateSessions] of sessionsByDate) {
    if (dayMap.has(date)) continue;
    const items: StudentDaySessionItem[] = dateSessions.map((session) => {
      const record = lookup.get(attendanceKey(session.id, input.studentId));
      const past = isSessionPast(session.date, session.time, now);
      return {
        sessionId: session.id,
        title: session.title,
        time: session.time,
        status: record
          ? isAttendanceTrackedDate(session.date)
            ? record.status
            : "untracked"
          : past
            ? isAttendanceTrackedDate(session.date)
              ? "absent"
              : "untracked"
            : "upcoming",
        joinedAt: record?.joinedAt,
      };
    });
    dayMap.set(date, {
      date,
      dateLabel: formatYmdInPakistan(date, { weekday: true, month: "short" }),
      sessions: items,
      status: rollupDayStatus(items),
    });
  }

  return [...dayMap.values()].sort((a, b) => b.date.localeCompare(a.date));
}

function rollupDayStatus(items: StudentDaySessionItem[]): AttendanceCellStatus {
  if (items.some((item) => item.status === "present")) return "present";
  if (items.some((item) => item.status === "late")) return "late";
  if (items.some((item) => item.status === "absent")) return "absent";
  if (items.every((item) => item.status === "untracked")) return "untracked";
  return "upcoming";
}

export function computeSessionRows(input: {
  sessions: AttendanceSessionRef[];
  students: AttendanceStudentRef[];
  records: AttendanceRecordRef[];
  programSlug: string;
  now?: Date;
}): SessionAttendanceRow[] {
  const now = input.now ?? new Date();
  const programSessions = input.sessions
    .filter((session) => session.programSlug === input.programSlug)
    .sort((a, b) => {
      const aStart = parseSessionDateTime(a.date, a.time)?.getTime() ?? 0;
      const bStart = parseSessionDateTime(b.date, b.time)?.getTime() ?? 0;
      return bStart - aStart;
    });

  const eligible = getEligibleStudents(input.students, input.programSlug);
  const lookup = buildAttendanceLookup(input.records);

  return programSessions.map((session) => {
    const isPast = isSessionPast(session.date, session.time, now);
    const isCounted = isPast && isAttendanceTrackedDate(session.date);
    let present = 0;
    let late = 0;

    for (const student of eligible) {
      const record = lookup.get(attendanceKey(session.id, student.id));
      if (!record) continue;
      if (record.status === "present") present += 1;
      else late += 1;
    }

    const attended = present + late;
    const expected = isCounted ? eligible.length : 0;
    const absent = isCounted ? Math.max(0, expected - attended) : 0;
    const rate = expected > 0 ? Math.round((attended / expected) * 100) : 0;

    return {
      sessionId: session.id,
      title: session.title,
      date: session.date,
      time: session.time,
      isPast,
      present,
      late,
      absent,
      expected,
      rate,
    };
  });
}

export function computeDayRows(sessionRows: SessionAttendanceRow[]): DayAttendanceRow[] {
  const byDate = new Map<string, SessionAttendanceRow[]>();

  for (const row of sessionRows.filter((session) => session.isPast && session.expected > 0)) {
    const list = byDate.get(row.date) ?? [];
    list.push(row);
    byDate.set(row.date, list);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, sessions]) => {
      const present = sessions.reduce((sum, session) => sum + session.present, 0);
      const late = sessions.reduce((sum, session) => sum + session.late, 0);
      const absent = sessions.reduce((sum, session) => sum + session.absent, 0);
      const expected = sessions.reduce((sum, session) => sum + session.expected, 0);
      const attended = present + late;
      const rate = expected > 0 ? Math.round((attended / expected) * 100) : 0;

      return {
        date,
        dateLabel: formatYmdInPakistan(date, { weekday: true, month: "short" }),
        sessions: sessions.sort((a, b) => a.time.localeCompare(b.time)),
        present,
        late,
        absent,
        expected,
        rate,
      };
    });
}

export function computeModuleRows(input: {
  sessions: AttendanceSessionRef[];
  students: AttendanceStudentRef[];
  records: AttendanceRecordRef[];
  programSlug: string;
  now?: Date;
}): ModuleAttendanceRow[] {
  const now = input.now ?? new Date();
  const pastCount = filterTrackedPastSessions(
    input.sessions.filter((session) => session.programSlug === input.programSlug),
    now
  ).length;
  const scheduleFallback = getTrackedScheduleCompletedCount(input.programSlug, now);
  const totalExpectedPerStudent = Math.max(pastCount, scheduleFallback > 0 ? scheduleFallback : pastCount);
  const programStudents = input.students.filter((student) => student.programSlug === input.programSlug);
  const groups = groupStudentsByModule(
    programStudents.map((student) => ({
      ...student,
      level: student.level ?? undefined,
    })),
    input.programSlug
  );

  return groups.map((group) => {
    const studentRows: ModuleStudentAttendance[] = group.students.map((student) => {
      const eligible = canAccessModuleOneClasses(
        input.programSlug,
        student.level,
        undefined,
        student.email
      );
      const studentRecords = input.records.filter(
        (record) => record.studentId === student.id && isAttendanceTrackedDate(record.sessionDate)
      );
      const present = studentRecords.filter((record) => record.status === "present").length;
      const late = studentRecords.filter((record) => record.status === "late").length;
      const attended = studentRecords.length;
      const expected = eligible ? totalExpectedPerStudent : 0;
      const missed = eligible ? Math.max(0, expected - attended) : 0;
      const rate = expected > 0 ? Math.round((attended / expected) * 100) : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        attended,
        present,
        late,
        missed,
        totalExpected: expected,
        rate: Math.min(100, rate),
      };
    });

    const present = studentRows.reduce((sum, row) => sum + row.present, 0);
    const late = studentRows.reduce((sum, row) => sum + row.late, 0);
    const absent = studentRows.reduce((sum, row) => sum + row.missed, 0);
    const expected = studentRows.reduce((sum, row) => sum + row.totalExpected, 0);
    const attended = present + late;
    const rate = expected > 0 ? Math.round((attended / expected) * 100) : 0;

    return {
      moduleName: group.moduleName,
      studentCount: group.students.length,
      present,
      late,
      absent,
      expected,
      rate,
      students: studentRows.sort((a, b) => a.studentName.localeCompare(b.studentName)),
    };
  });
}

export function computeAttendanceOverview(input: {
  sessions: AttendanceSessionRef[];
  students: AttendanceStudentRef[];
  records: AttendanceRecordRef[];
  programSlug: string;
  now?: Date;
}): AttendanceOverview {
  const sessionRows = computeSessionRows(input).filter(
    (row) => row.isPast && row.expected > 0
  );
  const eligible = getEligibleStudents(input.students, input.programSlug);

  const present = sessionRows.reduce((sum, row) => sum + row.present, 0);
  const late = sessionRows.reduce((sum, row) => sum + row.late, 0);
  const absent = sessionRows.reduce((sum, row) => sum + row.absent, 0);
  const totalMarks = present + late + absent;
  const attended = present + late;
  const rate = totalMarks > 0 ? Math.round((attended / totalMarks) * 100) : 0;

  return {
    totalStudents: input.students.filter((student) => student.programSlug === input.programSlug).length,
    eligibleStudents: eligible.length,
    pastSessions: sessionRows.length,
    totalMarks,
    present,
    late,
    absent,
    rate,
  };
}

export function computeAttendanceMatrix(input: {
  sessions: AttendanceSessionRef[];
  students: AttendanceStudentRef[];
  records: AttendanceRecordRef[];
  programSlug: string;
  now?: Date;
}): AttendanceMatrix {
  const now = input.now ?? new Date();
  const programSessions = input.sessions
    .filter((session) => session.programSlug === input.programSlug)
    .sort((a, b) => {
      const aStart = parseSessionDateTime(a.date, a.time)?.getTime() ?? 0;
      const bStart = parseSessionDateTime(b.date, b.time)?.getTime() ?? 0;
      return aStart - bStart;
    });

  const lookup = buildAttendanceLookup(input.records);
  const programStudents = input.students
    .filter((student) => student.programSlug === input.programSlug)
    .sort((a, b) => a.name.localeCompare(b.name));

  const students: AttendanceMatrixStudent[] = programStudents.map((student) => {
    const eligible = canAccessModuleOneClasses(
      input.programSlug,
      student.level,
      undefined,
      student.email
    );
    const cells: Record<string, AttendanceCellStatus> = {};
    let attended = 0;

    for (const session of programSessions) {
      const record = lookup.get(attendanceKey(session.id, student.id));
      const past = isSessionPast(session.date, session.time, now);

      if (record) {
        cells[session.id] = isAttendanceTrackedDate(session.date) ? record.status : "untracked";
        if (isAttendanceTrackedDate(session.date)) attended += 1;
      } else if (!past) {
        cells[session.id] = "upcoming";
      } else if (!isAttendanceTrackedDate(session.date)) {
        cells[session.id] = "untracked";
      } else if (eligible) {
        cells[session.id] = "absent";
      } else {
        cells[session.id] = "upcoming";
      }
    }

    const pastSessions = filterTrackedPastSessions(programSessions, now).length;
    const scheduleFallback = getTrackedScheduleCompletedCount(input.programSlug, now);
    const expected = eligible
      ? Math.max(pastSessions, scheduleFallback > 0 ? scheduleFallback : pastSessions)
      : 0;
    const rate = expected > 0 ? Math.round((attended / expected) * 100) : 0;

    return {
      studentId: student.id,
      studentName: student.name,
      module: student.level?.trim() || "—",
      cells,
      attended,
      missed: eligible ? Math.max(0, expected - attended) : 0,
      rate: Math.min(100, rate),
    };
  });

  return { sessions: programSessions, students };
}
