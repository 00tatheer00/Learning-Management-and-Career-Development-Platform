"use client";

import { useCallback, useEffect, useState } from "react";
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

const DASHBOARD_SHELL =
  "flex h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)] flex-col gap-3 min-h-0 overflow-hidden";

const pressable = "cursor-pointer select-none transition-all duration-200";

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
    return (
      <div className="h-full min-h-0 flex flex-col">
        <AdminDashboardSkeleton />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 p-8 text-center">
        <p className="text-sm font-medium text-red-800">{error ?? "Something went wrong"}</p>
        <button
          type="button"
          onClick={() => void load()}
          className={cn(pressable, "mt-4 text-sm font-medium text-red-700 underline-offset-2 hover:underline")}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <AdminDashboardHome data={data} />
    </div>
  );
}

function AdminDashboardHome({ data }: { data: AdminDashboardData }) {
  const loginRate =
    data.students > 0 ? Math.round((data.loggedInStudents / data.students) * 100) : 0;
  const approvalRate =
    data.totalEnrollments > 0
      ? Math.round((data.approvedEnrollments / data.totalEnrollments) * 100)
      : 0;

  return (
    <div className={DASHBOARD_SHELL}>
      {/* Header */}
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200/80 pb-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
            Overview
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {data.students.toLocaleString()} students · {data.trainers} trainers · {approvalRate}%
            approval rate
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {data.pendingEnrollments > 0 && (
            <Link
              href="/admin/enrollments"
              className={cn(
                pressable,
                "inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800"
              )}
            >
              {data.pendingEnrollments} pending review
              <ArrowRight size={14} weight="bold" />
            </Link>
          )}
          <Link
            href="/admin/live-classes"
            className={cn(
              pressable,
              "inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
            )}
          >
            <Broadcast size={15} weight="duotone" />
            Portal classes
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard
          href="/admin/enrollments"
          label="Total registrations"
          value={data.totalEnrollments}
          hint="All-time submissions"
          icon={<ClipboardText size={18} weight="duotone" />}
        />
        <MetricCard
          href="/admin/enrollments"
          label="Paid / approved"
          value={data.approvedEnrollments}
          hint={data.trends.approved}
          icon={<ChartBar size={18} weight="duotone" />}
          trend={data.trends.approved}
        />
        <MetricCard
          href="/admin/enrollments"
          label="Pending review"
          value={data.pendingEnrollments}
          hint={data.trends.pending}
          icon={<ClipboardText size={18} weight="duotone" />}
          highlight={data.pendingEnrollments > 0}
          trend={data.trends.pending}
        />
        <MetricCard
          href="/admin/students"
          label="Active students"
          value={data.students}
          hint={data.trends.students}
          icon={<GraduationCap size={18} weight="duotone" />}
          trend={data.trends.students}
        />
      </div>

      {/* Insight cards */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
        <InsightCard href="/admin/credentials" title="Portal logins" icon={<Key size={18} weight="duotone" />}>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
              <CountUp end={data.loggedInStudents} duration={1.2} separator="," />
            </span>
            <span className="text-sm text-zinc-400">/ {data.students.toLocaleString()}</span>
            <span className="ml-auto text-xs font-medium text-zinc-500">{loginRate}% logged in</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-800 transition-all duration-700"
              style={{ width: `${loginRate}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {data.neverLoggedInStudents} students have not logged in yet
          </p>
        </InsightCard>

        <InsightCard
          href="/admin/courses"
          title="Live content"
          icon={<VideoCamera size={18} weight="duotone" />}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                <CountUp end={data.upcomingSessions} duration={1.2} />
              </p>
              <p className="mt-1 text-xs text-zinc-500">Upcoming classes</p>
            </div>
            <div>
              <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                <CountUp end={data.assignments} duration={1.2} />
              </p>
              <p className="mt-1 text-xs text-zinc-500">Assignments</p>
            </div>
          </div>
        </InsightCard>
      </div>

      {/* Bottom panel */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-3 overflow-y-auto scrollbar-none pb-0.5">
        <div className="lg:col-span-3 rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
          <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Student mix</h2>
              <p className="text-xs text-zinc-500 mt-0.5">First-time vs returning registrations</p>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-1 min-h-0">
            <DonutChart first={data.firstTimeRegistrations} returning={data.returningRegistrations} />
            <div className="flex-1 min-w-0 space-y-4">
              <BreakdownRow
                label="First-time students"
                value={data.firstTimeRegistrations}
                total={data.firstTimeRegistrations + data.returningRegistrations}
                badge={data.trends.approved}
                positive
              />
              <BreakdownRow
                label="Returning students"
                value={data.returningRegistrations}
                total={data.firstTimeRegistrations + data.returningRegistrations}
                badge={`${data.returningRegistrations} re-enrolled`}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-zinc-100 shrink-0">
            <ProgramPill label="Trainers" value={data.trainers} href="/admin/trainers" />
            <ProgramPill
              label="Web Dev"
              value={data.webStudents}
              href="/admin/students"
              icon={<UsersThree size={14} weight="duotone" />}
            />
            <ProgramPill
              label="Flutter"
              value={data.appStudents}
              href="/admin/students"
              icon={<DeviceMobile size={14} weight="duotone" />}
            />
          </div>

          {data.missingTrainerAssignments > 0 && (
            <Link
              href="/admin/settings"
              className={cn(
                pressable,
                "mt-3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              )}
            >
              {data.missingTrainerAssignments} students need trainer assignment sync
              <ArrowRight size={12} className="ml-auto text-zinc-400" />
            </Link>
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col min-h-0">
          <div className="mb-3 shrink-0">
            <h2 className="text-sm font-semibold text-zinc-900">Quick access</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Jump to admin tools</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1 flex-1 content-start auto-rows-min">
            {QUICK_LINKS.map((link) => (
              <QuickLink key={link.href} {...link} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  {
    href: "/admin/live-classes",
    title: "Portal classes",
    subtitle: "Live video rooms",
    icon: <Broadcast size={17} weight="duotone" />,
  },
  {
    href: "/admin/enrollments",
    title: "Registrations",
    subtitle: "Approve and reject",
    icon: <ClipboardText size={17} weight="duotone" />,
  },
  {
    href: "/admin/students",
    title: "Students",
    subtitle: "All accounts",
    icon: <GraduationCap size={17} weight="duotone" />,
  },
  {
    href: "/admin/credentials",
    title: "Portal logins",
    subtitle: "IDs and passwords",
    icon: <Key size={17} weight="duotone" />,
  },
  {
    href: "/admin/trainers",
    title: "Trainers",
    subtitle: "Manage team",
    icon: <UsersThree size={17} weight="duotone" />,
  },
  {
    href: "/admin/courses",
    title: "Courses",
    subtitle: "Syllabus and content",
    icon: <VideoCamera size={17} weight="duotone" />,
  },
] as const;

function MetricCard({
  label,
  value,
  hint,
  icon,
  href,
  highlight,
  trend,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  href?: string;
  highlight?: boolean;
  trend?: string;
}) {
  const inner = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
        {icon}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-900">
          <CountUp end={value} duration={1.2} separator="," />
        </p>
        <p className="mt-1 text-xs font-medium text-zinc-500">{label}</p>
      </div>
      <TrendLine text={trend ?? hint} />
      {highlight && (
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-zinc-900" aria-hidden="true" />
      )}
    </>
  );

  const className = cn(
    pressable,
    "group relative rounded-xl border bg-white p-4",
    highlight
      ? "border-zinc-300 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      : "border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
    "hover:border-zinc-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
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
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "block rounded-xl border border-zinc-200/80 bg-white p-4 sm:p-5",
        "shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-zinc-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">{title}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
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
  badge,
  positive,
}: {
  label: string;
  value: number;
  total: number;
  badge: string;
  positive?: boolean;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-xs font-medium text-zinc-700 truncate">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-zinc-900 shrink-0">
          <CountUp end={value} duration={1} separator="," />
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            positive ? "bg-zinc-800" : "bg-zinc-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="inline-block mt-1.5 text-[10px] font-medium text-zinc-400">{badge}</span>
    </div>
  );
}

function ProgramPill({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: number;
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "rounded-lg border border-zinc-100 bg-zinc-50/50 px-2 py-2.5 text-center hover:border-zinc-200 hover:bg-white"
      )}
    >
      <div className="flex items-center justify-center gap-1 text-zinc-600">
        {icon}
        <p className="text-base font-semibold tabular-nums text-zinc-900">
          <CountUp end={value} duration={1} />
        </p>
      </div>
      <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-wide">{label}</p>
    </Link>
  );
}

function QuickLink({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "group flex items-center gap-3 rounded-lg px-2 py-2.5 -mx-2",
        "hover:bg-zinc-50"
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 text-zinc-600 group-hover:border-zinc-200 group-hover:bg-white">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 truncate">{title}</p>
        <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
      </div>
      <ArrowRight
        size={14}
        className="shrink-0 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all"
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
        isNegative ? "text-red-600/80" : isPositive ? "text-emerald-700/80" : "text-zinc-400"
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
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const firstLen = (firstPct / 100) * circumference;
  const returnLen = circumference - firstLen;

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#f4f4f5" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth="8"
          strokeDasharray={`${firstLen} ${returnLen}`}
          strokeLinecap="round"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#a1a1aa"
          strokeWidth="8"
          strokeDasharray={`${returnLen} ${firstLen}`}
          strokeDashoffset={-firstLen}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold tabular-nums text-zinc-900">{total}</span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-400">Total</span>
      </div>
    </div>
  );
}
