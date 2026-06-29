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
  Lightning,
  Sparkle,
  TrendDown,
  TrendUp,
  UsersThree,
  VideoCamera,
} from "@phosphor-icons/react";
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";
import type { AdminDashboardData } from "@/lib/api/admin-dashboard";
import { cn } from "@/lib/utils";

/** Fills portal main area — no clip; bottom section scrolls if viewport is short. */
const DASHBOARD_SHELL =
  "flex h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)] flex-col gap-2 min-h-0 overflow-hidden";

const pressable = "cursor-pointer select-none transition-all duration-300";

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
      <div className="rounded-2xl border border-red-200/80 bg-red-50 p-8 text-center">
        <p className="text-sm font-semibold text-red-800">{error ?? "Something went wrong"}</p>
        <button
          type="button"
          onClick={() => void load()}
          className={cn(pressable, "mt-4 text-sm font-semibold text-red-700 underline")}
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
      {/* Hero — compact */}
      <div className="relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950 px-4 py-3 shadow-lg shadow-zinc-900/15">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(251,146,60,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(249,115,22,0.2) 0%, transparent 40%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-200/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Command Center
              </h1>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400 truncate">
              {data.students} students · {data.trainers} trainers · {approvalRate}% approved
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {data.pendingEnrollments > 0 && (
              <Link
                href="/admin/enrollments"
                className={cn(
                  pressable,
                  "inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-orange-500/25 hover:bg-orange-400"
                )}
              >
                <Lightning size={14} weight="fill" />
                {data.pendingEnrollments} pending
                <ArrowRight size={12} weight="bold" />
              </Link>
            )}
            <Link
              href="/admin/live-classes"
              className={cn(
                pressable,
                "inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
              )}
            >
              <Broadcast size={14} weight="duotone" />
              Classes
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics — compact row */}
      <div className="shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-2">
        <MetricCard
          href="/admin/enrollments"
          label="Total Registrations"
          value={data.totalEnrollments}
          hint="All-time submissions"
          icon={<ClipboardText size={18} weight="duotone" />}
          accent="from-rose-500 to-pink-600"
          glow="shadow-rose-500/20"
        />
        <MetricCard
          href="/admin/enrollments"
          label="Paid / Approved"
          value={data.approvedEnrollments}
          hint={data.trends.approved}
          icon={<Sparkle size={18} weight="duotone" />}
          accent="from-emerald-500 to-teal-600"
          glow="shadow-emerald-500/20"
          trend={data.trends.approved}
        />
        <MetricCard
          href="/admin/enrollments"
          label="Pending Review"
          value={data.pendingEnrollments}
          hint={data.trends.pending}
          icon={<ChartBar size={18} weight="duotone" />}
          accent="from-sky-500 to-blue-600"
          glow="shadow-sky-500/20"
          pulse={data.pendingEnrollments > 0}
          trend={data.trends.pending}
        />
        <MetricCard
          href="/admin/students"
          label="Active Students"
          value={data.students}
          hint={data.trends.students}
          icon={<GraduationCap size={18} weight="duotone" />}
          accent="from-amber-500 to-orange-600"
          glow="shadow-orange-500/20"
          trend={data.trends.students}
        />
      </div>

      {/* Spotlight — compact */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-2">
        <SpotlightCard
          href="/admin/credentials"
          title="Portal Logins"
          icon={<Key size={18} weight="duotone" />}
          accent="from-violet-500 to-purple-700"
        >
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">
              <CountUp end={data.loggedInStudents} duration={1.2} separator="," />
            </span>
            <span className="text-sm font-medium text-white/50">/ {data.students}</span>
            <span className="ml-auto text-xs font-semibold text-white/70">{loginRate}% logged in</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
              style={{ width: `${loginRate}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/50">
            {data.neverLoggedInStudents} never logged in
          </p>
        </SpotlightCard>

        <SpotlightCard
          href="/admin/courses"
          title="Live Content"
          icon={<VideoCamera size={18} weight="duotone" />}
          accent="from-cyan-500 to-blue-700"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-white">
                <CountUp end={data.upcomingSessions} duration={1.2} />
              </p>
              <p className="text-[11px] text-white/60">Upcoming classes</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold tabular-nums text-white">
                <CountUp end={data.assignments} duration={1.2} />
              </p>
              <p className="text-[11px] text-white/60">Assignments</p>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Bottom — fills remaining height, scrolls if needed */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-2 overflow-y-auto scrollbar-none">
        <div className="lg:col-span-3 rounded-xl border border-zinc-200/80 bg-white p-3 sm:p-4 shadow-sm flex flex-col min-h-0">
          <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Student Mix</h2>
              <p className="text-[10px] text-zinc-500">First-time vs returning</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-500">
              Analytics
            </span>
          </div>

          <div className="flex items-center gap-4 flex-1 min-h-0">
            <DonutChart first={data.firstTimeRegistrations} returning={data.returningRegistrations} />
            <div className="flex-1 min-w-0 space-y-2">
              <BreakdownRow
                label="First-time students"
                value={data.firstTimeRegistrations}
                total={data.firstTimeRegistrations + data.returningRegistrations}
                color="bg-gradient-to-r from-orange-400 to-amber-500"
                badge={data.trends.approved}
                positive
              />
              <BreakdownRow
                label="Returning students"
                value={data.returningRegistrations}
                total={data.firstTimeRegistrations + data.returningRegistrations}
                color="bg-gradient-to-r from-emerald-400 to-teal-500"
                badge={`${data.returningRegistrations} re-enrolled`}
              />
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-100 shrink-0">
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
                "mt-2 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200/80 px-3 py-2 text-[10px] font-semibold text-amber-900 hover:bg-amber-100"
              )}
            >
              <Lightning size={14} weight="fill" className="text-amber-600 shrink-0" />
              {data.missingTrainerAssignments} students need trainer sync
              <ArrowRight size={12} className="ml-auto" />
            </Link>
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-zinc-200/80 bg-zinc-950 p-3 sm:p-4 shadow-sm flex flex-col min-h-0">
          <div className="mb-2 shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-orange-400/90">
              Quick Access
            </p>
            <h2 className="text-sm font-bold text-white">Jump in</h2>
          </div>
          <div className="grid grid-cols-2 gap-1.5 flex-1 content-start auto-rows-min">
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
    title: "Portal Classes",
    subtitle: "Live video rooms",
    icon: <Broadcast size={18} weight="duotone" />,
    accent: "group-hover:shadow-orange-500/25",
    iconBg: "bg-orange-500/20 text-orange-400",
  },
  {
    href: "/admin/enrollments",
    title: "Registrations",
    subtitle: "Approve & reject",
    icon: <ClipboardText size={18} weight="duotone" />,
    accent: "group-hover:shadow-amber-500/25",
    iconBg: "bg-amber-500/20 text-amber-400",
  },
  {
    href: "/admin/students",
    title: "Students",
    subtitle: "All accounts",
    icon: <GraduationCap size={18} weight="duotone" />,
    accent: "group-hover:shadow-blue-500/25",
    iconBg: "bg-blue-500/20 text-blue-400",
  },
  {
    href: "/admin/credentials",
    title: "Portal Logins",
    subtitle: "IDs & passwords",
    icon: <Key size={18} weight="duotone" />,
    accent: "group-hover:shadow-violet-500/25",
    iconBg: "bg-violet-500/20 text-violet-400",
  },
  {
    href: "/admin/trainers",
    title: "Trainers",
    subtitle: "Manage team",
    icon: <ChartBar size={18} weight="duotone" />,
    accent: "group-hover:shadow-fuchsia-500/25",
    iconBg: "bg-fuchsia-500/20 text-fuchsia-400",
  },
  {
    href: "/admin/courses",
    title: "Courses",
    subtitle: "Syllabus & content",
    icon: <VideoCamera size={18} weight="duotone" />,
    accent: "group-hover:shadow-emerald-500/25",
    iconBg: "bg-emerald-500/20 text-emerald-400",
  },
] as const;

function MetricCard({
  label,
  value,
  hint,
  icon,
  accent,
  glow,
  href,
  pulse,
  trend,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  accent: string;
  glow: string;
  href?: string;
  pulse?: boolean;
  trend?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            accent,
            glow
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold tabular-nums leading-none text-zinc-900">
            <CountUp end={value} duration={1.2} separator="," />
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-zinc-600 truncate">{label}</p>
        </div>
        {pulse && (
          <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
        )}
      </div>
      <TrendLine text={trend ?? hint} />
    </>
  );

  const className = cn(
    pressable,
    "group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-2.5 shadow-sm",
    "hover:border-zinc-300 hover:shadow-md"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80 group-hover:opacity-100 transition-opacity",
            accent
          )}
        />
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}

function SpotlightCard({
  href,
  title,
  icon,
  accent,
  children,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "group relative block overflow-hidden rounded-xl p-3 shadow-md hover:shadow-lg",
        "bg-gradient-to-br text-white",
        accent
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-xl"
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-semibold text-white/85">{title}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
          {icon}
        </div>
      </div>
      <div className="relative">{children}</div>
    </Link>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  color,
  badge,
  positive,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  badge: string;
  positive?: boolean;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-xs font-semibold text-zinc-800 truncate">{label}</p>
        <p className="text-sm font-bold tabular-nums text-zinc-900 shrink-0">
          <CountUp end={value} duration={1} separator="," />
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${pct}%` }} />
      </div>
      <span
        className={cn(
          "inline-block mt-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold",
          positive ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
        )}
      >
        {badge}
      </span>
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
        "rounded-lg border border-zinc-100 bg-zinc-50/80 px-2 py-2 text-center hover:bg-white hover:border-zinc-200"
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {icon}
        <p className="text-base font-bold tabular-nums text-zinc-900">
          <CountUp end={value} duration={1} />
        </p>
      </div>
      <p className="text-[10px] font-semibold text-zinc-500 mt-0.5 uppercase tracking-wide">{label}</p>
    </Link>
  );
}

function QuickLink({
  href,
  title,
  subtitle,
  icon,
  accent,
  iconBg,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "group flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 p-2",
        "hover:bg-white/8 hover:border-white/15",
        accent
      )}
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white truncate">{title}</p>
        <p className="text-[10px] text-zinc-500 truncate hidden sm:block">{subtitle}</p>
      </div>
      <ArrowRight size={12} className="shrink-0 text-zinc-600 group-hover:text-orange-400" />
    </Link>
  );
}

function TrendLine({ text }: { text: string }) {
  const isPositive = text.startsWith("+");
  const isNegative = text.startsWith("-");

  return (
    <p
      className={cn(
        "flex items-center gap-1 mt-1 text-[10px] font-medium",
        isNegative ? "text-red-500" : isPositive ? "text-emerald-600" : "text-zinc-400"
      )}
    >
      {isPositive && <TrendUp size={12} weight="bold" />}
      {isNegative && <TrendDown size={12} weight="bold" />}
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
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#f4f4f5" strokeWidth="9" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="url(#donutOrange)"
          strokeWidth="9"
          strokeDasharray={`${firstLen} ${returnLen}`}
          strokeLinecap="round"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="url(#donutGreen)"
          strokeWidth="9"
          strokeDasharray={`${returnLen} ${firstLen}`}
          strokeDashoffset={-firstLen}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="donutOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="donutGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums text-zinc-900">{total}</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Total</span>
      </div>
    </div>
  );
}
