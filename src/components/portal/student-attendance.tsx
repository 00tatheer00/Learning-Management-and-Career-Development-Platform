import "server-only";

import Link from "next/link";
import { CalendarBlank, CheckCircle, Clock, ListChecks, Target, XCircle } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentAttendanceSummary } from "@/lib/api/class-attendance";
import { getLiveSessionsPreview } from "@/lib/api/portal-data";
import type { AttendanceCellStatus } from "@/lib/api/attendance-analytics";
import { getAttendanceStatusMeta } from "@/lib/api/attendance-insights";
import {
  filterByStudentModule,
  studentHasModuleLiveContent,
} from "@/lib/modules/student-module-content";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";
import { ModuleStartsSoonNotice } from "@/components/portal/module-starts-soon-notice";
import { AttendanceStreakBadge, StudentAttendanceMissedAlert } from "@/components/portal/student-attendance-alert";
import { PortalPageHeader, PortalSurfaceCard } from "@/components/portal/portal-ui";
import { formatAppliedDateTime } from "@/lib/utils";
import { findNextUpcomingSession } from "@/lib/utils/session-datetime";
import { parseSessionDateTime } from "@/lib/sessions/join-window";
import { formatHoursUntilClass } from "@/lib/api/attendance-insights";
import { cn } from "@/lib/utils";
import { lateThresholdDescription, ATTENDANCE_TRACKING_START_DATE, ATTENDANCE_GOAL_PERCENT } from "@/lib/constants/attendance";

interface StudentAttendanceProgressCardProps {
  programSlug: string;
  studentId: string;
  studentLevel?: string | null;
  studentEmail?: string | null;
}

export async function StudentAttendanceProgressCard({
  programSlug,
  studentId,
  studentLevel,
  studentEmail,
}: StudentAttendanceProgressCardProps) {
  const moduleContext = {
    programSlug,
    studentLevel: studentLevel ?? null,
    approvedLevels: studentLevel ? [studentLevel] : [],
    email: studentEmail,
  };
  const sessions = await getLiveSessionsPreview(programSlug);
  const canTrack = studentHasModuleLiveContent(moduleContext, sessions);
  if (!canTrack) return null;

  const stats = await getStudentAttendanceSummary(studentId, programSlug);
  const percentage = stats.percentage;

  const barTone =
    percentage >= ATTENDANCE_GOAL_PERCENT
      ? "from-primary to-[#1873cc]"
      : percentage >= 50
        ? "from-[#71717a] to-[#52525b]"
        : "from-rose-700 to-rose-900";

  return (
    <div className="rounded-2xl border border-pt overflow-hidden portal-card">
      <div className="px-5 py-4 border-b border-pt bg-gradient-to-r from-[#1a4d8f] to-[#1e90ff] text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">
                My Attendance
              </p>
              <AttendanceStreakBadge streak={stats.streak} />
            </div>
            <p className="text-2xl font-bold mt-0.5">{percentage}%</p>
          </div>
          <Link
            href="/student/attendance"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 backdrop-blur px-3 py-2 text-xs font-bold hover:bg-white/25 transition-colors"
          >
            <ListChecks size={14} weight="duotone" />
            Full report
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-all", barTone)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-pt-muted">
          {stats.attended} of {stats.totalExpected} classes attended
        </p>
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5",
            stats.onTrack ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
          )}
        >
          <Target size={14} weight="duotone" />
          {stats.goalMessage}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatPill label="Present" value={stats.present} icon={<CheckCircle size={14} weight="fill" />} tone="emerald" />
          <StatPill label="Late" value={stats.late} icon={<Clock size={14} weight="fill" />} tone="amber" />
          <StatPill label="Missed" value={stats.missed} icon={<XCircle size={14} weight="fill" />} tone="rose" />
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "emerald" | "amber" | "rose";
}) {
  const tones = {
    emerald: "text-white bg-emerald-600 border-emerald-700 shadow-sm",
    amber: "text-white bg-amber-500 border-amber-600 shadow-sm",
    rose: "text-white bg-rose-600 border-rose-700 shadow-sm",
  };

  return (
    <div className={cn("rounded-xl border px-3 py-2 text-center", tones[tone])}>
      <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

export async function StudentAttendancePageContent() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const moduleContext = await getStudentModuleContentContext(user);
  const allSessions = await getLiveSessionsPreview(programSlug);
  const canTrack = studentHasModuleLiveContent(moduleContext, allSessions);
  const sessions = filterByStudentModule(allSessions, moduleContext, (session) => session.level);

  if (!canTrack) {
    return (
      <div className="space-y-4">
        <PortalPageHeader
          title="My Attendance"
          description="Attendance tracking starts when your module goes live."
        />
        <ModuleStartsSoonNotice programSlug={programSlug} studentModule={user.level} />
      </div>
    );
  }

  const stats = await getStudentAttendanceSummary(user.id, programSlug);
  const nextSession = findNextUpcomingSession(sessions, programSlug);
  const nextSessionAt = nextSession
    ? parseSessionDateTime(nextSession.date, nextSession.time)
    : null;
  const nextClassReminder =
    nextSessionAt != null
      ? formatHoursUntilClass(nextSessionAt.getTime(), Date.now())
      : null;

  const percentage = stats.percentage;
  const barTone =
    percentage >= ATTENDANCE_GOAL_PERCENT
      ? "from-primary to-[#1873cc]"
      : percentage >= 50
        ? "from-[#71717a] to-[#52525b]"
        : "from-rose-700 to-rose-900";

  return (
    <div className="space-y-4">
      <PortalPageHeader
        title="My Attendance"
        description={`Recorded when you join class from the portal (from ${ATTENDANCE_TRACKING_START_DATE}). Present on time, ${lateThresholdDescription()}.`}
      />

      <StudentAttendanceMissedAlert
        programSlug={programSlug}
        studentId={user.id}
        studentLevel={user.level}
        studentEmail={user.email}
      />

      {nextSession && nextClassReminder && (
        <PortalSurfaceCard className="p-4 border-primary/20 bg-primary/5">
          <p className="text-sm font-semibold text-pt flex items-center gap-2">
            <CalendarBlank size={18} weight="duotone" className="text-primary" />
            Next class: {nextSession.title}
          </p>
          <p className="text-xs text-pt-muted mt-1">
            {nextClassReminder} · {nextSession.date} at {nextSession.time}
          </p>
        </PortalSurfaceCard>
      )}

      <PortalSurfaceCard className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-pt-faint">Overall</p>
          <AttendanceStreakBadge streak={stats.streak} />
        </div>
        <p className="text-4xl font-bold text-pt mt-1">{percentage}%</p>
        <div className="mt-4 h-4 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r", barTone)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-pt-muted">
          {stats.attended} attended · {stats.missed} missed · {stats.totalExpected} total classes
        </p>
        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 text-sm font-semibold rounded-xl px-3 py-2",
            stats.onTrack ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-900 border border-amber-200"
          )}
        >
          <Target size={16} weight="duotone" />
          {stats.goalMessage}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <StatPill label="Present" value={stats.present} icon={<CheckCircle size={14} weight="fill" />} tone="emerald" />
          <StatPill label="Late" value={stats.late} icon={<Clock size={14} weight="fill" />} tone="amber" />
          <StatPill label="Missed" value={stats.missed} icon={<XCircle size={14} weight="fill" />} tone="rose" />
        </div>
      </PortalSurfaceCard>

      <PortalSurfaceCard className="overflow-hidden">
        <div className="px-4 py-3 border-b border-pt bg-gradient-to-r from-slate-800 to-slate-700 text-white flex items-center gap-2">
          <CalendarBlank size={18} weight="duotone" />
          <p className="text-sm font-bold">Day by Day</p>
        </div>
        {stats.days.length === 0 ? (
          <p className="p-6 text-sm text-pt-muted text-center">
            Class days will appear here once your batch starts.
          </p>
        ) : (
          <ul className="divide-y divide-pt">
            {stats.days.map((day) => (
              <li key={day.date} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm text-pt">{day.dateLabel}</p>
                    {day.classNumber != null && (
                      <p className="text-xs text-pt-muted mt-0.5">Class {day.classNumber}</p>
                    )}
                  </div>
                  <DayStatusBadge status={day.status} />
                </div>
                <div className="space-y-1.5">
                  {day.sessions.map((session, index) => (
                    <div
                      key={session.sessionId ?? `${day.date}-${index}`}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm",
                        session.status === "present" && "border-emerald-300 bg-emerald-50",
                        session.status === "late" && "border-amber-300 bg-amber-50",
                        session.status === "absent" && "border-rose-300 bg-rose-100",
                        session.status === "upcoming" && "border-pt bg-surface/40"
                      )}
                    >
                      <div>
                        <p className="font-medium text-pt">{session.title}</p>
                        <p className="text-xs text-pt-muted">{session.time}</p>
                        <p className="text-[11px] text-pt-muted mt-0.5">
                          {getAttendanceStatusMeta(session.status).description}
                        </p>
                        {session.joinedAt && (
                          <p className="text-xs text-pt-muted mt-0.5">
                            Joined {formatAppliedDateTime(session.joinedAt)}
                          </p>
                        )}
                      </div>
                      <DayStatusBadge status={session.status} compact />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PortalSurfaceCard>

      <PortalSurfaceCard className="overflow-hidden">
        <div className="px-4 py-3 border-b border-pt bg-surface/50">
          <p className="text-sm font-bold text-pt">Class History</p>
        </div>
        {stats.records.length === 0 ? (
          <p className="p-6 text-sm text-pt-muted text-center">
            No classes joined yet. Tap Join Class on Live Classes when your class starts.
          </p>
        ) : (
          <ul className="divide-y divide-pt">
            {stats.records.map((record) => (
              <li key={`${record.sessionId}-${record.joinedAt}`} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-pt">{record.sessionTitle}</p>
                  <p className="text-xs text-pt-muted mt-0.5">
                    {record.sessionDate} · {record.sessionTime}
                  </p>
                  <p className="text-xs text-pt-muted mt-0.5">
                    Joined {formatAppliedDateTime(record.joinedAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                    record.status === "present"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                >
                  {record.status === "present" ? (
                    <CheckCircle size={14} weight="fill" />
                  ) : (
                    <Clock size={14} weight="fill" />
                  )}
                  {record.status === "present" ? "Present" : "Late"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </PortalSurfaceCard>
    </div>
  );
}

function DayStatusBadge({
  status,
  compact = false,
}: {
  status: AttendanceCellStatus;
  compact?: boolean;
}) {
  const meta = getAttendanceStatusMeta(status);
  const config = {
    present: {
      icon: <CheckCircle size={compact ? 12 : 14} weight="fill" />,
      className: "bg-emerald-600 text-white",
    },
    late: {
      icon: <Clock size={compact ? 12 : 14} weight="fill" />,
      className: "bg-amber-500 text-white",
    },
    absent: {
      icon: <XCircle size={compact ? 12 : 14} weight="fill" />,
      className: "bg-rose-600 text-white",
    },
    upcoming: {
      icon: <CalendarBlank size={compact ? 12 : 14} weight="duotone" />,
      className: "bg-sky-600 text-white",
    },
    untracked: {
      icon: <CalendarBlank size={compact ? 12 : 14} weight="duotone" />,
      className: "bg-slate-500 text-white",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.className
      )}
      title={meta.description}
    >
      {config.icon}
      {meta.label}
    </span>
  );
}
