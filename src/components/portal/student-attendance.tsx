import Link from "next/link";
import { CalendarBlank, CheckCircle, Clock, ListChecks, XCircle } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentAttendanceSummary } from "@/lib/api/class-attendance";
import type { AttendanceCellStatus } from "@/lib/api/attendance-analytics";
import { canAccessModuleOneClasses } from "@/lib/modules/student-module-access";
import { ModuleStartsSoonNotice } from "@/components/portal/module-starts-soon-notice";
import { PortalPageHeader, PortalSurfaceCard } from "@/components/portal/portal-ui";
import { formatAppliedDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { lateThresholdDescription, ATTENDANCE_TRACKING_START_DATE } from "@/lib/constants/attendance";

interface StudentAttendanceProgressCardProps {
  programSlug: string;
  studentId: string;
  studentLevel?: string | null;
}

export async function StudentAttendanceProgressCard({
  programSlug,
  studentId,
  studentLevel,
}: StudentAttendanceProgressCardProps) {
  const canTrack = canAccessModuleOneClasses(programSlug, studentLevel);
  if (!canTrack) return null;

  const stats = await getStudentAttendanceSummary(studentId, programSlug);
  const percentage = stats.percentage;

  const barTone =
    percentage >= 80
      ? "from-primary to-[#1873cc]"
      : percentage >= 50
        ? "from-[#71717a] to-[#52525b]"
        : "from-rose-700 to-rose-900";

  return (
    <div className="rounded-2xl border border-pt overflow-hidden portal-card">
      <div className="px-5 py-4 border-b border-pt bg-gradient-to-r from-[#1a4d8f] to-[#1e90ff] text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">
              My Attendance
            </p>
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
        <div className="h-3 rounded-full bg-surface overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-all", barTone)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-pt-muted">
          {stats.attended} of {stats.totalExpected} classes attended
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
    emerald: "text-primary bg-primary/10 border-primary/25",
    amber: "text-[#a1a1aa] bg-pt-muted border-pt",
    rose: "text-rose-300 bg-rose-950/30 border-rose-800/40",
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
  const canTrack = canAccessModuleOneClasses(programSlug, user.level);

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
  const percentage = stats.percentage;
  const barTone =
    percentage >= 80
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

      <PortalSurfaceCard className="p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-pt-faint">Overall</p>
        <p className="text-4xl font-bold text-pt mt-1">{percentage}%</p>
        <div className="mt-4 h-4 rounded-full bg-surface overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r", barTone)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-pt-muted">
          {stats.attended} attended · {stats.missed} missed · {stats.totalExpected} total classes
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
                        session.status === "present" && "border-[#1f6b45]/20 bg-[#1f6b45]/5",
                        session.status === "late" && "border-primary/30 bg-primary/8",
                        session.status === "absent" && "border-rose-300 bg-rose-50",
                        session.status === "upcoming" && "border-pt bg-surface/40"
                      )}
                    >
                      <div>
                        <p className="font-medium text-pt">{session.title}</p>
                        <p className="text-xs text-pt-muted">{session.time}</p>
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
                      ? "bg-[#ecf8f1] text-[#1f6b45]"
                      : "bg-primary/10 text-[[#1873cc]]"
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
  const config = {
    present: {
      label: "Present",
      icon: <CheckCircle size={compact ? 12 : 14} weight="fill" />,
      className: "bg-[#ecf8f1] text-[#1f6b45]",
    },
    late: {
      label: "Late",
      icon: <Clock size={compact ? 12 : 14} weight="fill" />,
      className: "bg-primary/10 text-[[#1873cc]]",
    },
    absent: {
      label: "Absent",
      icon: <XCircle size={compact ? 12 : 14} weight="fill" />,
      className: "bg-rose-50 text-rose-800",
    },
    upcoming: {
      label: "Upcoming",
      icon: <CalendarBlank size={compact ? 12 : 14} weight="duotone" />,
      className: "bg-surface text-pt-muted border border-pt",
    },
    untracked: {
      label: "Not tracked",
      icon: <CalendarBlank size={compact ? 12 : 14} weight="duotone" />,
      className: "bg-surface text-pt-muted border border-pt",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
