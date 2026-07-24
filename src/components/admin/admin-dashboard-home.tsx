"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CountUp from "react-countup";
import {
  ArrowRight,
  Broadcast,
  ChartBar,
  ClipboardText,
  DeviceMobile,
  GraduationCap,
  Key,
  TrendDown,
  TrendUp,
  UsersThree,
  VideoCamera,
} from "@phosphor-icons/react";
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";
import type { AdminDashboardData } from "@/lib/api/admin-dashboard";
import { cn } from "@/lib/utils";

const DASHBOARD_SHELL = "flex flex-col gap-4 pb-4";

const pressable = "cursor-pointer select-none transition-all duration-200";

/** Muted executive palette — tinted surfaces, not loud gradients */
const tones = {
  slate: {
    card: "portal-tone-slate border shadow-pt hover:shadow-pt-md",
    icon: "portal-tone-icon portal-tone-icon-slate",
    bar: "bg-slate-600",
    dot: "bg-slate-600",
  },
  emerald: {
    card: "portal-tone-emerald border shadow-pt hover:shadow-pt-md",
    icon: "portal-tone-icon portal-tone-icon-emerald",
    bar: "bg-emerald-600",
    dot: "bg-emerald-500",
  },
  amber: {
    card: "portal-tone-amber border shadow-pt hover:shadow-pt-md",
    icon: "portal-tone-icon portal-tone-icon-amber",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  indigo: {
    card: "portal-tone-indigo border shadow-pt hover:shadow-pt-md",
    icon: "portal-tone-icon portal-tone-icon-indigo",
    bar: "bg-indigo-600",
    dot: "bg-indigo-500",
  },
  violet: {
    card: "portal-tone-violet border shadow-pt hover:shadow-pt-md",
    icon: "portal-tone-icon portal-tone-icon-violet",
    bar: "bg-violet-600",
    dot: "bg-violet-500",
  },
  sky: {
    card: "portal-tone-sky border shadow-pt hover:shadow-pt-md",
    icon: "portal-tone-icon portal-tone-icon-sky",
    bar: "bg-sky-600",
    dot: "bg-sky-500",
  },
  rose: {
    card: "portal-tone-rose border shadow-pt hover:shadow-pt-md",
    icon: "portal-tone-icon portal-tone-icon-rose",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
  teal: {
    card: "portal-tone-teal border shadow-pt hover:shadow-pt-md",
    icon: "portal-tone-icon portal-tone-icon-teal",
    bar: "bg-teal-600",
    dot: "bg-teal-500",
  },
} as const;

type ToneKey = keyof typeof tones;

export function AdminDashboardLoader() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error ?? "Could not load dashboard");
      }
    } catch {
      setError("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }
  if (error || !data) {
    return (
      <div className="portal-error-panel rounded-xl border p-8 text-center">
        <p className="text-sm font-medium">{error ?? "Something went wrong"}</p>
        <button
          type="button"
          onClick={() => void load()}
          className={cn(pressable, "mt-4 text-sm font-medium underline-offset-2 hover:underline opacity-90")}
        >
          Try again
        </button>
      </div>
    );
  }

  return <AdminDashboardHome data={data} />;
}

function AdminDashboardHome({ data }: { data: AdminDashboardData }) {
  const [phaseFilter, setPhaseFilter] = useState<"all" | "phase-1" | "phase-2">("all");

  const metrics = useMemo(() => {
    if (phaseFilter === "phase-1" && data.phaseBreakdown?.phase1) {
      return data.phaseBreakdown.phase1;
    }
    if (phaseFilter === "phase-2" && data.phaseBreakdown?.phase2) {
      return data.phaseBreakdown.phase2;
    }
    return {
      totalEnrollments: data.totalEnrollments,
      approvedEnrollments: data.approvedEnrollments,
      pendingEnrollments: data.pendingEnrollments,
      students: data.students,
      firstTimeRegistrations: data.firstTimeRegistrations,
      returningRegistrations: data.returningRegistrations,
      estimatedRevenue: data.estimatedRevenue,
      loggedInStudents: data.loggedInStudents,
      webStudents: data.webStudents,
      appStudents: data.appStudents,
    };
  }, [phaseFilter, data]);

  const loginRate =
    metrics.students > 0 ? Math.round((metrics.loggedInStudents / metrics.students) * 100) : 0;
  const approvalRate =
    metrics.totalEnrollments > 0
      ? Math.round((metrics.approvedEnrollments / metrics.totalEnrollments) * 100)
      : 0;

  const displayData: AdminDashboardData = {
    ...data,
    totalEnrollments: metrics.totalEnrollments,
    approvedEnrollments: metrics.approvedEnrollments,
    pendingEnrollments: metrics.pendingEnrollments,
    students: metrics.students,
    firstTimeRegistrations: metrics.firstTimeRegistrations,
    returningRegistrations: metrics.returningRegistrations,
    estimatedRevenue: metrics.estimatedRevenue,
    loggedInStudents: metrics.loggedInStudents,
    neverLoggedInStudents: Math.max(0, metrics.students - metrics.loggedInStudents),
    webStudents: metrics.webStudents,
    appStudents: metrics.appStudents,
  };

  return (
    <div className={DASHBOARD_SHELL}>
      {/* Header with Phase Toggle */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-pt pb-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-pt-faint">
            Overview
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-pt sm:text-2xl flex items-center gap-2">
            Dashboard
            {phaseFilter !== "all" && (
              <span className={cn(
                "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                phaseFilter === "phase-1" ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              )}>
                {phaseFilter === "phase-1" ? "Phase 1 (Module 1)" : "Phase 2 (2nd Module)"}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-pt-muted">
            {metrics.students.toLocaleString()} students · {data.trainers} trainers · {approvalRate}%
            approval rate
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Interactive Phase Filter Buttons */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPhaseFilter("all")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-all",
                phaseFilter === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              All ({data.totalEnrollments})
            </button>
            <button
              type="button"
              onClick={() => setPhaseFilter("phase-1")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-all flex items-center gap-1.5",
                phaseFilter === "phase-1"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Phase 1 ({data.phaseBreakdown?.phase1.totalEnrollments ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setPhaseFilter("phase-2")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-all flex items-center gap-1.5",
                phaseFilter === "phase-2"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Phase 2 ({data.phaseBreakdown?.phase2.totalEnrollments ?? 0})
            </button>
          </div>

          {metrics.pendingEnrollments > 0 && (
            <Link
              href="/admin/enrollments"
              className={cn(
                pressable,
                "inline-flex items-center gap-2 rounded-lg bg-amber-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-amber-800 shadow-sm shadow-amber-900/10"
              )}
            >
              {metrics.pendingEnrollments} pending
              <ArrowRight size={14} weight="bold" />
            </Link>
          )}
        </div>
      </div>

      {/* Registration Phases Overview Cards */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Phase 1 Card */}
        <div
          onClick={() => setPhaseFilter(phaseFilter === "phase-1" ? "all" : "phase-1")}
          className={cn(
            pressable,
            "group relative rounded-xl border p-4 sm:p-5 transition-all",
            tones.indigo.card,
            phaseFilter === "phase-1" ? "ring-2 ring-indigo-500 shadow-pt-md" : ""
          )}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs", tones.indigo.icon)}>
                P1
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-pt">Phase 1 (Module 1)</h3>
                <p className="text-xs text-pt-muted">HTML &amp; CSS Module</p>
              </div>
            </div>
            <span className={cn(
              "rounded-full px-3 py-1 text-xs font-extrabold border shadow-sm transition-all",
              phaseFilter === "phase-1"
                ? "bg-indigo-600 text-white border-indigo-700"
                : "bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-700"
            )}>
              {data.phaseBreakdown?.phase1.totalEnrollments ?? 0} Registrations
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg border border-pt-subtle bg-pt-surface/70 text-center">
            <div>
              <p className="text-lg font-semibold tabular-nums text-pt">
                <CountUp end={data.phaseBreakdown?.phase1.approvedEnrollments ?? 0} duration={1} />
              </p>
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Approved</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-pt">
                <CountUp end={data.phaseBreakdown?.phase1.pendingEnrollments ?? 0} duration={1} />
              </p>
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Pending</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-pt">
                <CountUp end={data.phaseBreakdown?.phase1.students ?? 0} duration={1} />
              </p>
              <p className="text-[11px] font-medium text-pt-secondary">Active Students</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-medium text-pt-muted">
            <span>Estimated Revenue</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              PKR {(data.phaseBreakdown?.phase1.estimatedRevenue ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Phase 2 Card */}
        <div
          onClick={() => setPhaseFilter(phaseFilter === "phase-2" ? "all" : "phase-2")}
          className={cn(
            pressable,
            "group relative rounded-xl border p-4 sm:p-5 transition-all",
            tones.emerald.card,
            phaseFilter === "phase-2" ? "ring-2 ring-emerald-500 shadow-pt-md" : ""
          )}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs", tones.emerald.icon)}>
                P2
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-pt">Phase 2 (2nd Module)</h3>
                <p className="text-xs text-pt-muted">Advanced Level Registrations</p>
              </div>
            </div>
            <span className={cn(
              "rounded-full px-3 py-1 text-xs font-extrabold border shadow-sm transition-all",
              phaseFilter === "phase-2"
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700"
            )}>
              {data.phaseBreakdown?.phase2.totalEnrollments ?? 0} Registrations
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg border border-pt-subtle bg-pt-surface/70 text-center">
            <div>
              <p className="text-lg font-semibold tabular-nums text-pt">
                <CountUp end={data.phaseBreakdown?.phase2.approvedEnrollments ?? 0} duration={1} />
              </p>
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Approved</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-pt">
                <CountUp end={data.phaseBreakdown?.phase2.pendingEnrollments ?? 0} duration={1} />
              </p>
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Pending</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-pt">
                <CountUp end={data.phaseBreakdown?.phase2.students ?? 0} duration={1} />
              </p>
              <p className="text-[11px] font-medium text-pt-secondary">Active Students</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-medium text-pt-muted">
            <span>Estimated Revenue</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              PKR {(data.phaseBreakdown?.phase2.estimatedRevenue ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard
          href="/admin/enrollments"
          label="Total registrations"
          value={metrics.totalEnrollments}
          hint="Submissions count"
          icon={<ClipboardText size={18} weight="duotone" />}
          tone="slate"
        />
        <MetricCard
          href="/admin/enrollments"
          label="Paid / approved"
          value={metrics.approvedEnrollments}
          hint={data.trends.approved}
          icon={<ChartBar size={18} weight="duotone" />}
          trend={data.trends.approved}
          tone="emerald"
        />
        <MetricCard
          href="/admin/enrollments"
          label="Pending review"
          value={metrics.pendingEnrollments}
          hint={data.trends.pending}
          icon={<ClipboardText size={18} weight="duotone" />}
          highlight={metrics.pendingEnrollments > 0}
          trend={data.trends.pending}
          tone="amber"
        />
        <MetricCard
          href="/admin/students"
          label="Active students"
          value={metrics.students}
          hint={data.trends.students}
          icon={<GraduationCap size={18} weight="duotone" />}
          trend={data.trends.students}
          tone="indigo"
        />
      </div>

      {/* Insight cards */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
        <InsightCard
          href="/admin/credentials"
          title="Portal logins"
          icon={<Key size={18} weight="duotone" />}
          tone="violet"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums tracking-tight text-pt">
              <CountUp end={metrics.loggedInStudents} duration={1.2} separator="," />
            </span>
            <span className="text-sm text-pt-faint">/ {metrics.students.toLocaleString()}</span>
            <span className="ml-auto text-xs font-medium text-pt-muted">{loginRate}% logged in</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full portal-progress-track">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-700"
              style={{ width: `${loginRate}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-pt-muted">
            {displayData.neverLoggedInStudents} students have not logged in yet
          </p>
        </InsightCard>

        <InsightCard
          href="/admin/courses"
          title="Live content"
          icon={<VideoCamera size={18} weight="duotone" />}
          tone="sky"
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-semibold tabular-nums tracking-tight text-pt">
                <CountUp end={data.upcomingSessions} duration={1.2} />
              </p>
              <p className="mt-1 text-xs text-pt-muted">Upcoming classes</p>
            </div>
            <div>
              <p className="text-3xl font-semibold tabular-nums tracking-tight text-pt">
                <CountUp end={data.assignments} duration={1.2} />
              </p>
              <p className="mt-1 text-xs text-pt-muted">Assignments</p>
            </div>
          </div>
        </InsightCard>
      </div>

      {/* Bottom panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <StudentMixPanel data={displayData} />

        <div className="lg:col-span-2 portal-panel portal-panel-slate p-4 sm:p-5">
          <div className="mb-3">
            <h2 className="text-sm font-semibold tracking-tight text-pt">Quick access</h2>
            <p className="text-xs text-pt-muted mt-0.5">Jump to admin tools</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-0.5">
            {QUICK_LINKS.map((link) => (
              <QuickLink key={link.href} {...link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentMixPanel({ data }: { data: AdminDashboardData }) {
  const mixTotal = data.firstTimeRegistrations + data.returningRegistrations;

  return (
    <div className="lg:col-span-3 portal-panel portal-panel-sky p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold tracking-tight text-pt">Student mix</h2>
        <p className="text-sm text-pt-muted mt-1">First-time vs returning registrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[7.5rem_1fr] lg:grid-cols-[8.5rem_1fr] gap-6 md:gap-8 items-start">
        <div className="mx-auto md:mx-0 w-full max-w-[8.5rem]">
          <DonutChart first={data.firstTimeRegistrations} returning={data.returningRegistrations} />
          <div className="mt-3 flex flex-col gap-1.5 text-[11px] text-pt-secondary">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" aria-hidden="true" />
              First-time
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
              Returning
            </span>
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          <BreakdownRow
            label="First-time students"
            value={data.firstTimeRegistrations}
            total={mixTotal}
            meta="Share of approved mix"
            barClass="bg-indigo-600"
          />
          <BreakdownRow
            label="Returning students"
            value={data.returningRegistrations}
            total={mixTotal}
            meta="Re-enrolled applicants"
            barClass="bg-teal-500"
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-sky-100/80">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-pt-muted mb-3">
          By program
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ProgramPill label="Trainers" value={data.trainers} href="/admin/trainers" tone="rose" />
          <ProgramPill
            label="Web Dev"
            value={data.webStudents}
            href="/admin/students"
            icon={<UsersThree size={14} weight="duotone" />}
            tone="indigo"
          />
          <ProgramPill
            label="Flutter"
            value={data.appStudents}
            href="/admin/students"
            icon={<DeviceMobile size={14} weight="duotone" />}
            tone="teal"
          />
        </div>
      </div>

      {data.missingTrainerAssignments > 0 && (
        <Link
          href="/admin/settings"
          className={cn(
            pressable,
            "mt-4 flex items-center gap-2 rounded-lg portal-alert-link px-3 py-2.5 text-xs font-medium hover:opacity-90"
          )}
        >
          {data.missingTrainerAssignments} students need trainer assignment sync
          <ArrowRight size={12} className="ml-auto opacity-70" />
        </Link>
      )}
    </div>
  );
}

const QUICK_LINKS: Array<{
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: ToneKey;
}> = [
  {
    href: "/admin/live-classes",
    title: "Portal classes",
    subtitle: "Live video rooms",
    icon: <Broadcast size={17} weight="duotone" />,
    tone: "sky",
  },
  {
    href: "/admin/enrollments",
    title: "Registrations",
    subtitle: "Approve and reject",
    icon: <ClipboardText size={17} weight="duotone" />,
    tone: "amber",
  },
  {
    href: "/admin/students",
    title: "Students",
    subtitle: "All accounts",
    icon: <GraduationCap size={17} weight="duotone" />,
    tone: "indigo",
  },
  {
    href: "/admin/credentials",
    title: "Portal logins",
    subtitle: "IDs and passwords",
    icon: <Key size={17} weight="duotone" />,
    tone: "violet",
  },
  {
    href: "/admin/trainers",
    title: "Trainers",
    subtitle: "Manage team",
    icon: <UsersThree size={17} weight="duotone" />,
    tone: "rose",
  },
  {
    href: "/admin/courses",
    title: "Courses",
    subtitle: "Syllabus and content",
    icon: <VideoCamera size={17} weight="duotone" />,
    tone: "emerald",
  },
];

function MetricCard({
  label,
  value,
  hint,
  icon,
  href,
  highlight,
  trend,
  tone = "slate",
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  href?: string;
  highlight?: boolean;
  trend?: string;
  tone?: ToneKey;
}) {
  const palette = tones[tone];

  const inner = (
    <>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          palette.icon
        )}
      >
        {icon}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-pt">
          <CountUp end={value} duration={1.2} separator="," />
        </p>
        <p className="mt-1 text-xs font-medium text-pt-secondary">{label}</p>
      </div>
      <TrendLine text={trend ?? hint} />
      {highlight && (
        <span
          className={cn("absolute top-3 right-3 h-2 w-2 rounded-full animate-pulse", palette.dot)}
          aria-hidden="true"
        />
      )}
    </>
  );

  const className = cn(
    pressable,
    "group relative rounded-xl border p-4",
    palette.card
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}

function InsightCard({
  href,
  title,
  icon,
  children,
  tone = "slate",
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: ToneKey;
}) {
  const palette = tones[tone];

  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "block rounded-xl border p-4 sm:p-5",
        palette.card
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pt-muted">{title}</p>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            palette.icon
          )}
        >
          {icon}
        </div>
      </div>
      {children}
    </Link>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  meta,
  barClass,
}: {
  label: string;
  value: number;
  total: number;
  meta: string;
  barClass: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="portal-card-muted rounded-lg px-4 py-3.5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-pt">{label}</p>
          <p className="text-xs text-pt-muted mt-0.5">{meta}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-semibold tabular-nums tracking-tight text-pt">
            <CountUp end={value} duration={1} separator="," />
          </p>
          <p className="text-xs font-medium text-pt-muted">{pct}%</p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full portal-progress-track">
        <div
          className={cn("h-2 max-h-2 rounded-full transition-all duration-1000", barClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProgramPill({
  label,
  value,
  href,
  icon,
  tone = "slate",
}: {
  label: string;
  value: number;
  href: string;
  icon?: React.ReactNode;
  tone?: ToneKey;
}) {
  const palette = tones[tone];

  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "rounded-lg border px-3 py-3 shadow-sm hover:shadow-md",
        palette.card
      )}
    >
      <p className="text-[11px] font-medium text-pt-secondary">{label}</p>
      <div className="mt-2 flex items-center gap-1.5">
        {icon && (
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md",
              palette.icon
            )}
          >
            {icon}
          </div>
        )}
        <p className="text-lg font-semibold tabular-nums text-pt">
          <CountUp end={value} duration={1} />
        </p>
      </div>
    </Link>
  );
}

function QuickLink({
  href,
  title,
  subtitle,
  icon,
  tone = "slate",
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone?: ToneKey;
}) {
  const palette = tones[tone];

  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "group flex items-center gap-3 rounded-lg px-2 py-2.5 -mx-2",
        "hover:bg-pt-muted"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-pt-subtle",
          palette.icon
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-pt truncate">{title}</p>
        <p className="text-xs text-pt-muted truncate">{subtitle}</p>
      </div>
      <ArrowRight
        size={14}
        className="shrink-0 text-pt-faint group-hover:text-pt-muted group-hover:translate-x-0.5 transition-all"
      />
    </Link>
  );
}

function TrendLine({ text }: { text: string }) {
  const isPositive = text.startsWith("+");
  const isNegative = text.startsWith("-");

  return (
    <p
      className={cn(
        "flex items-center gap-1 mt-2 text-[11px] font-medium",
        isNegative ? "text-red-600/80" : isPositive ? "text-emerald-700/80" : "text-pt-faint"
      )}
    >
      {isPositive && <TrendUp size={11} weight="bold" />}
      {isNegative && <TrendDown size={11} weight="bold" />}
      {text}
    </p>
  );
}

function DonutChart({ first, returning }: { first: number; returning: number }) {
  const total = Math.max(first + returning, 1);
  const firstPct = (first / total) * 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const firstLen = (firstPct / 100) * circumference;
  const returnLen = circumference - firstLen;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[8.5rem]">
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#e4e4e7" strokeWidth="10" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="10"
          strokeDasharray={`${firstLen} ${returnLen}`}
          strokeLinecap="round"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="10"
          strokeDasharray={`${returnLen} ${firstLen}`}
          strokeDashoffset={-firstLen}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-semibold tabular-nums tracking-tight text-pt">{total}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-pt-faint">Total</span>
      </div>
    </div>
  );
}
