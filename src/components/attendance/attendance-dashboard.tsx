"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarBlank,
  ChartPie,
  CheckCircle,
  Clock,
  DownloadSimple,
  GraduationCap,
  MagnifyingGlass,
  Users,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { ATTENDANCE_GOAL_PERCENT } from "@/lib/constants/attendance";
import { formatAppliedDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PORTAL_VIEWPORT_PANEL } from "@/lib/constants/portal-layout";
import { lateThresholdDescription, ATTENDANCE_TRACKING_START_DATE } from "@/lib/constants/attendance";
import type {
  AttendanceOverview,
  DayAttendanceRow,
  ModuleAttendanceRow,
  SessionAttendanceRow,
} from "@/lib/api/attendance-analytics";
import type {
  AttendanceReportRow,
  AttendanceRecordsPage,
  LowAttendanceStudent,
  PreClassAttendanceAlert,
  SessionAttendanceDetail,
} from "@/lib/api/class-attendance";

type AttendanceTab = "overview" | "days" | "modules" | "sessions" | "records";

interface AttendanceAnalytics {
  overview: AttendanceOverview;
  sessions: SessionAttendanceRow[];
  days: DayAttendanceRow[];
  modules: ModuleAttendanceRow[];
  matrix: {
    sessions: Array<{ id: string; title: string; date: string; time: string }>;
    students: Array<{
      studentId: string;
      studentName: string;
      module: string;
      rate: number;
      attended: number;
      missed: number;
      cells: Record<string, "present" | "late" | "absent" | "upcoming" | "untracked">;
    }>;
  };
  records: AttendanceRecordsPage;
  batches: string[];
  preClassAlerts: PreClassAttendanceAlert[];
  lowAttendanceStudents: LowAttendanceStudent[];
}

interface AttendanceDashboardProps {
  mode: "admin" | "trainer";
  title?: string;
  description?: string;
}

const TABS: Array<{ id: AttendanceTab; label: string; icon: typeof ChartPie }> = [
  { id: "overview", label: "Overview", icon: ChartPie },
  { id: "days", label: "By Day", icon: CalendarBlank },
  { id: "modules", label: "By Module", icon: GraduationCap },
  { id: "sessions", label: "Sessions", icon: Users },
  { id: "records", label: "All Records", icon: CheckCircle },
];

function buildApiUrl(
  mode: "admin" | "trainer",
  filters: {
    programFilter: string;
    dateFrom: string;
    dateTo: string;
    batch: string;
    lowAttendance: boolean;
    recordsPage: number;
  }
) {
  const params = new URLSearchParams();
  if (mode === "admin") params.set("programSlug", filters.programFilter);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.batch && filters.batch !== "all") params.set("batch", filters.batch);
  if (filters.lowAttendance) params.set("lowAttendance", "1");
  params.set("page", String(filters.recordsPage));
  params.set("pageSize", "25");

  const base =
    mode === "admin" ? "/api/admin/attendance/analytics" : "/api/trainer/attendance";
  return `${base}?${params.toString()}`;
}

export function AttendanceDashboard({
  mode,
  title = "Attendance Management",
  description = `Auto-recorded when students join class from the portal (from ${ATTENDANCE_TRACKING_START_DATE}). Present if on time, ${lateThresholdDescription()}.`,
}: AttendanceDashboardProps) {
  const [tab, setTab] = useState<AttendanceTab>("overview");
  const [programFilter, setProgramFilter] = useState("web-development");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [batch, setBatch] = useState("all");
  const [lowAttendance, setLowAttendance] = useState(false);
  const [recordsPage, setRecordsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttendanceAnalytics | null>(null);
  const [search, setSearch] = useState("");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<SessionAttendanceDetail | null>(null);
  const [sessionDetailLoading, setSessionDetailLoading] = useState(false);

  const apiUrl = useMemo(
    () =>
      buildApiUrl(mode, {
        programFilter,
        dateFrom,
        dateTo,
        batch,
        lowAttendance,
        recordsPage,
      }),
    [mode, programFilter, dateFrom, dateTo, batch, lowAttendance, recordsPage]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setData(json.data as AttendanceAnalytics);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadSessionDetail = useCallback(
    async (sessionId: string) => {
      setSelectedSessionId(sessionId);
      setSessionDetailLoading(true);
      try {
        const params = new URLSearchParams({ programSlug: programFilter });
        if (batch !== "all") params.set("batch", batch);
        const res = await fetch(`/api/admin/attendance/sessions/${sessionId}?${params}`);
        const json = await res.json();
        if (json.success) setSessionDetail(json.data as SessionAttendanceDetail);
      } finally {
        setSessionDetailLoading(false);
      }
    },
    [programFilter, batch]
  );

  const filteredRows = useMemo(() => {
    const rows = data?.records.rows ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      [row.studentName, row.sessionTitle, row.sessionDate, row.sessionTime]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [data?.records.rows, search]);

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams({ programSlug: programFilter });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (batch !== "all") params.set("batch", batch);
    return `/api/admin/attendance/export?${params.toString()}`;
  }, [programFilter, dateFrom, dateTo, batch]);

  const overview = data?.overview;

  return (
    <div className={PORTAL_VIEWPORT_PANEL}>
      <PortalPageHeader title={title} description={description} />

      {mode === "admin" && (
        <div className="shrink-0 flex gap-1.5 overflow-x-auto pb-1">
          {ENROLLABLE_PROGRAM_SLUGS.map((slug) => (
            <FilterPill
              key={slug}
              active={programFilter === slug}
              onClick={() => {
                setProgramFilter(slug);
                setRecordsPage(1);
              }}
              label={getProgramCategory(slug)?.shortLabel ?? slug}
            />
          ))}
        </div>
      )}

      <div className="shrink-0 flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-background p-3">
        <FilterField label="From">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setRecordsPage(1);
            }}
            className="h-9"
          />
        </FilterField>
        <FilterField label="To">
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setRecordsPage(1);
            }}
            className="h-9"
          />
        </FilterField>
        <FilterField label="Batch">
          <select
            value={batch}
            onChange={(e) => {
              setBatch(e.target.value);
              setRecordsPage(1);
            }}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="all">All batches</option>
            {(data?.batches ?? []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterPill
          active={lowAttendance}
          onClick={() => {
            setLowAttendance((current) => !current);
            setRecordsPage(1);
          }}
          label={`< ${ATTENDANCE_GOAL_PERCENT}% only`}
        />
        {mode === "admin" && (
          <Button variant="outline" size="sm" asChild className="ml-auto">
            <a href={exportUrl}>
              <DownloadSimple size={16} className="mr-1.5" />
              Export CSV
            </a>
          </Button>
        )}
      </div>

      <div className="shrink-0 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                tab === item.id
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-background text-muted hover:border-primary/30"
              )}
            >
              <Icon size={14} weight="duotone" />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted py-16">
          Loading attendance...
        </div>
      ) : !data ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted py-16">
          Could not load attendance data.
        </div>
      ) : (
        <>
          {tab === "overview" && overview && (
            <OverviewTab
              overview={overview}
              sessions={data.sessions.filter((s) => s.isPast)}
              preClassAlerts={data.preClassAlerts}
              lowAttendanceStudents={data.lowAttendanceStudents}
              mode={mode}
              onSessionClick={mode === "admin" ? loadSessionDetail : undefined}
            />
          )}
          {tab === "days" && (
            <DaysTab
              days={data.days}
              onSessionClick={mode === "admin" ? loadSessionDetail : undefined}
            />
          )}
          {tab === "modules" && (
            <ModulesTab
              modules={data.modules}
              expandedModule={expandedModule}
              onToggle={(name) =>
                setExpandedModule((current) => (current === name ? null : name))
              }
            />
          )}
          {tab === "sessions" && <SessionsMatrixTab matrix={data.matrix} />}
          {tab === "records" && (
            <RecordsTab
              rows={filteredRows}
              search={search}
              onSearch={setSearch}
              page={data.records.page}
              totalPages={data.records.totalPages}
              total={data.records.total}
              onPageChange={setRecordsPage}
            />
          )}
        </>
      )}

      {selectedSessionId && (
        <SessionDetailModal
          loading={sessionDetailLoading}
          detail={sessionDetail}
          onClose={() => {
            setSelectedSessionId(null);
            setSessionDetail(null);
          }}
        />
      )}
    </div>
  );
}

function OverviewTab({
  overview,
  sessions,
  preClassAlerts,
  lowAttendanceStudents,
  mode,
  onSessionClick,
}: {
  overview: AttendanceOverview;
  sessions: SessionAttendanceRow[];
  preClassAlerts: PreClassAttendanceAlert[];
  lowAttendanceStudents: LowAttendanceStudent[];
  mode: "admin" | "trainer";
  onSessionClick?: (sessionId: string) => void;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-auto space-y-4">
      {preClassAlerts.length > 0 && (
        <div className="space-y-2">
          {preClassAlerts.map((alert) => (
            <div
              key={alert.sessionId}
              className="rounded-2xl border border-sky-200 bg-sky-50 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-sky-900">
                  {alert.phase === "live" ? "Class live now" : "Class starting soon"} · {alert.title}
                </p>
                <p className="text-xs text-sky-800 mt-0.5">
                  {alert.date} · {alert.time}
                </p>
              </div>
              <p className="text-sm font-semibold text-sky-900">
                {alert.joinedCount} joined · {alert.eligibleCount} eligible
              </p>
            </div>
          ))}
        </div>
      )}

      {lowAttendanceStudents.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-200 flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-amber-700" />
            <p className="text-sm font-bold text-amber-900">
              {mode === "trainer" ? "Weekly digest" : "Students below goal"} · under {ATTENDANCE_GOAL_PERCENT}%
            </p>
          </div>
          <ul className="divide-y divide-amber-100">
            {lowAttendanceStudents.map((student) => (
              <li
                key={student.studentId}
                className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-amber-950">{student.studentName}</p>
                  <p className="text-xs text-amber-800">
                    {student.module}
                    {student.batch ? ` · ${student.batch}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-rose-700">{student.rate}%</p>
                  <p className="text-xs text-amber-800">
                    {student.attended} attended · {student.missed} missed
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <MetricCard
          label="Attendance Rate"
          value={`${overview.rate}%`}
          hint={`${overview.present + overview.late} of ${overview.totalMarks} marks`}
          accent="emerald"
        />
        <MetricCard label="Present" value={overview.present} accent="sky" />
        <MetricCard label="Late" value={overview.late} accent="amber" />
        <MetricCard label="Absent" value={overview.absent} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <MetricCard
          label="Eligible Students"
          value={overview.eligibleStudents}
          hint="Module 1 · live class access"
          accent="slate"
        />
        <MetricCard label="Past Classes" value={overview.pastSessions} accent="slate" />
        <MetricCard label="Total Students" value={overview.totalStudents} accent="slate" />
      </div>

      <div className="rounded-2xl border border-border bg-gradient-to-br from-background to-surface/60 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Overall Progress</p>
        <div className="mt-3 h-3 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
            style={{ width: `${overview.rate}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted">
          {overview.rate}% class attendance across all completed sessions
        </p>
      </div>

      {sessions.length > 0 && (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-surface/50">
            <p className="text-sm font-bold">Recent Sessions</p>
          </div>
          <div className="divide-y divide-border">
            {sessions.slice(0, 6).map((session) => (
              <button
                key={session.sessionId}
                type="button"
                onClick={() => onSessionClick?.(session.sessionId)}
                className={cn(
                  "w-full text-left flex flex-wrap items-center justify-between gap-3 px-4 py-3",
                  onSessionClick && "hover:bg-surface/50 cursor-pointer"
                )}
              >
                <div>
                  <p className="font-semibold text-sm">{session.title}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {session.date} · {session.time}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MiniStat label="Present" value={session.present} tone="emerald" />
                  <MiniStat label="Late" value={session.late} tone="amber" />
                  <MiniStat label="Absent" value={session.absent} tone="rose" />
                  <RatePill rate={session.rate} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DaysTab({
  days,
  onSessionClick,
}: {
  days: DayAttendanceRow[];
  onSessionClick?: (sessionId: string) => void;
}) {
  if (days.length === 0) {
    return <EmptyState message="No class days recorded yet." />;
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto space-y-3">
      {days.map((day) => (
        <div
          key={day.date}
          className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
            <div>
              <p className="font-bold">{day.dateLabel}</p>
              <p className="text-xs text-white/70 mt-0.5">
                {day.sessions.length} session{day.sessions.length === 1 ? "" : "s"}
              </p>
            </div>
            <RatePill rate={day.rate} inverted />
          </div>
          <div className="p-4 grid grid-cols-3 gap-2">
            <MiniStat label="Present" value={day.present} tone="emerald" />
            <MiniStat label="Late" value={day.late} tone="amber" />
            <MiniStat label="Absent" value={day.absent} tone="rose" />
          </div>
          <div className="px-4 pb-4 space-y-2">
            {day.sessions.map((session) => (
              <button
                key={session.sessionId}
                type="button"
                onClick={() => onSessionClick?.(session.sessionId)}
                className={cn(
                  "w-full text-left flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5",
                  onSessionClick && "hover:bg-surface/50 cursor-pointer"
                )}
              >
                <div>
                  <p className="text-sm font-semibold">{session.title}</p>
                  <p className="text-xs text-muted">{session.time}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-700 font-semibold">{session.present} P</span>
                  <span className="text-amber-700 font-semibold">{session.late} L</span>
                  <span className="text-rose-700 font-semibold">{session.absent} A</span>
                  <RatePill rate={session.rate} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionDetailModal({
  detail,
  loading,
  onClose,
}: {
  detail: SessionAttendanceDetail | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-background shadow-xl flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
          <div>
            <p className="font-bold">{detail?.title ?? "Session attendance"}</p>
            {detail && (
              <p className="text-xs text-muted mt-0.5">
                {detail.date} · {detail.time} · {detail.joinedCount}/{detail.eligibleCount} joined
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <p className="text-sm text-muted py-8 text-center">Loading session...</p>
          ) : !detail ? (
            <p className="text-sm text-muted py-8 text-center">Could not load session.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="py-2 text-left text-xs font-semibold">Student</th>
                  <th className="py-2 text-left text-xs font-semibold">Batch</th>
                  <th className="py-2 text-left text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {detail.students.map((student) => (
                  <tr key={student.studentId}>
                    <td className="py-2.5 font-medium">{student.studentName}</td>
                    <td className="py-2.5 text-muted">{student.batch ?? "—"}</td>
                    <td className="py-2.5">
                      <CellBadge status={student.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function ModulesTab({
  modules,
  expandedModule,
  onToggle,
}: {
  modules: ModuleAttendanceRow[];
  expandedModule: string | null;
  onToggle: (name: string) => void;
}) {
  if (modules.length === 0) {
    return <EmptyState message="No students grouped by module yet." />;
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto space-y-3">
      {modules.map((module) => {
        const expanded = expandedModule === module.moduleName;
        return (
          <div
            key={module.moduleName}
            className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm"
          >
            <button
              type="button"
              onClick={() => onToggle(module.moduleName)}
              className="w-full text-left px-4 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{module.moduleName}</p>
                  <p className="text-xs text-white/75 mt-0.5">
                    {module.studentCount} student{module.studentCount === 1 ? "" : "s"}
                  </p>
                </div>
                <RatePill rate={module.rate} inverted />
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/90"
                  style={{ width: `${module.rate}%` }}
                />
              </div>
            </button>

            <div className="p-4 grid grid-cols-3 gap-2 border-b border-border">
              <MiniStat label="Present" value={module.present} tone="emerald" />
              <MiniStat label="Late" value={module.late} tone="amber" />
              <MiniStat label="Absent" value={module.absent} tone="rose" />
            </div>

            {expanded && (
              <div className="overflow-auto">
                <table className="min-w-[640px] w-full text-sm">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Student</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Attended</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Missed</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {module.students.map((student) => (
                      <tr key={student.studentId} className="hover:bg-surface/50">
                        <td className="px-3 py-2.5 font-medium">{student.studentName}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-emerald-700 font-semibold">{student.attended}</span>
                          <span className="text-muted text-xs ml-1">
                            ({student.present}P / {student.late}L)
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-rose-700 font-semibold">{student.missed}</td>
                        <td className="px-3 py-2.5">
                          <RatePill rate={student.rate} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SessionsMatrixTab({
  matrix,
}: {
  matrix: AttendanceAnalytics["matrix"];
}) {
  if (matrix.students.length === 0 || matrix.sessions.length === 0) {
    return <EmptyState message="Schedule classes first — attendance appears when students join." />;
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-border bg-background shadow-sm">
      <table className="min-w-[900px] w-full text-xs">
        <thead className="sticky top-0 z-10 bg-surface border-b border-border">
          <tr>
            <th className="px-3 py-2.5 text-left font-semibold sticky left-0 bg-surface z-20 min-w-[140px]">
              Student
            </th>
            <th className="px-2 py-2.5 text-left font-semibold min-w-[80px]">Module</th>
            <th className="px-2 py-2.5 text-center font-semibold min-w-[56px]">Rate</th>
            {matrix.sessions.map((session) => (
              <th
                key={session.id}
                className="px-2 py-2.5 text-center font-semibold min-w-[72px] max-w-[88px]"
                title={`${session.title} · ${session.date}`}
              >
                <span className="block truncate">{session.date.slice(5)}</span>
                <span className="block text-[10px] text-muted font-normal truncate">
                  {session.time}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {matrix.students.map((student) => (
            <tr key={student.studentId} className="hover:bg-surface/40">
              <td className="px-3 py-2 font-medium sticky left-0 bg-background z-10">
                {student.studentName}
              </td>
              <td className="px-2 py-2 text-muted truncate max-w-[100px]">{student.module}</td>
              <td className="px-2 py-2 text-center">
                <RatePill rate={student.rate} compact />
              </td>
              {matrix.sessions.map((session) => (
                <td key={session.id} className="px-2 py-2 text-center">
                  <CellBadge status={student.cells[session.id] ?? "upcoming"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecordsTab({
  rows,
  search,
  onSearch,
  page,
  totalPages,
  total,
  onPageChange,
}: {
  rows: AttendanceReportRow[];
  search: string;
  onSearch: (value: string) => void;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      <div className="relative shrink-0">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search student or class..."
          className="pl-9 h-9"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-border bg-background">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="sticky top-0 bg-surface border-b border-border">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Student</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Class</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Schedule</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Joined</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted">
                  No attendance records yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface/50">
                  <td className="px-3 py-2.5 font-medium">{row.studentName}</td>
                  <td className="px-3 py-2.5">{row.sessionTitle}</td>
                  <td className="px-3 py-2.5 text-muted">
                    {row.sessionDate} · {row.sessionTime}
                  </td>
                  <td className="px-3 py-2.5 text-muted text-xs">
                    {formatAppliedDateTime(row.joinedAt)}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="shrink-0 flex items-center justify-between gap-3 text-sm">
        <p className="text-muted">
          {total} record{total === 1 ? "" : "s"}
          {search.trim() ? " (filtered on this page)" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-muted min-w-[140px]">
      {label}
      {children}
    </label>
  );
}

function MetricCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent: "emerald" | "sky" | "amber" | "rose" | "slate";
}) {
  const styles = {
    emerald: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20",
    sky: "from-sky-500/10 to-blue-500/5 border-sky-500/20",
    amber: "from-amber-500/10 to-orange-500/5 border-amber-500/20",
    rose: "from-rose-500/10 to-red-500/5 border-rose-500/20",
    slate: "from-slate-500/10 to-zinc-500/5 border-border",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-4 shadow-sm",
        styles[accent]
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "rose";
}) {
  const colors = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
  };
  return (
    <div className="rounded-xl border border-border bg-surface/50 px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className={cn("text-lg font-bold", colors[tone])}>{value}</p>
    </div>
  );
}

function RatePill({
  rate,
  inverted = false,
  compact = false,
}: {
  rate: number;
  inverted?: boolean;
  compact?: boolean;
}) {
  const tone =
    rate >= ATTENDANCE_GOAL_PERCENT ? "emerald" : rate >= 50 ? "amber" : rate > 0 ? "rose" : "slate";

  const classes = {
    emerald: inverted ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800",
    amber: inverted ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800",
    rose: inverted ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800",
    slate: inverted ? "bg-white/20 text-white" : "bg-surface text-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        classes[tone]
      )}
    >
      {rate}%
    </span>
  );
}

function CellBadge({
  status,
}: {
  status: "present" | "late" | "absent" | "upcoming" | "untracked";
}) {
  if (status === "present") {
    return <CheckCircle size={18} weight="fill" className="mx-auto text-emerald-600" />;
  }
  if (status === "late") {
    return <Clock size={18} weight="fill" className="mx-auto text-amber-600" />;
  }
  if (status === "absent") {
    return <XCircle size={18} weight="fill" className="mx-auto text-rose-500" />;
  }
  if (status === "untracked") {
    return <span className="text-[10px] font-semibold text-muted">N/A</span>;
  }
  return <span className="text-muted">—</span>;
}

function StatusBadge({ status }: { status: "present" | "late" }) {
  const isPresent = status === "present";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isPresent ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
      )}
    >
      {isPresent ? <CheckCircle size={14} weight="fill" /> : <Clock size={14} weight="fill" />}
      {isPresent ? "Present" : "Late"}
    </span>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted hover:border-primary/30"
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-muted py-16 rounded-2xl border border-dashed border-border">
      {message}
    </div>
  );
}
