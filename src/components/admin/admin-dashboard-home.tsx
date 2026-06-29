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
import { PORTAL_VIEWPORT_PANEL } from "@/lib/constants/portal-layout";

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

  if (loading) return <AdminDashboardSkeleton />;
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

  return <AdminDashboardHome data={data} />;
}

function AdminDashboardHome({ data }: { data: AdminDashboardData }) {
  const loginRate =
    data.students > 0 ? Math.round((data.loggedInStudents / data.students) * 100) : 0;
  const approvalRate =
    data.totalEnrollments > 0
      ? Math.round((data.approvedEnrollments / data.totalEnrollments) * 100)
      : 0;

  return (
    <div className={cn(PORTAL_VIEWPORT_PANEL, "gap-4 sm:gap-5")}>
      {/* Hero */}
      <div className="relative shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950 p-5 sm:p-7 shadow-xl shadow-zinc-900/20">
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

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-orange-200/90 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Command Center
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-zinc-400 leading-relaxed">
              {data.students} active students · {data.trainers} trainers · {approvalRate}% approval
              rate
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {data.pendingEnrollments > 0 && (
              <Link
                href="/admin/enrollments"
                className={cn(
                  pressable,
                  "inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-400 hover:shadow-orange-400/40"
                )}
              >
                <Lightning size={16} weight="fill" />
                {data.pendingEnrollments} pending review
                <ArrowRight size={14} weight="bold" />
              </Link>
            )}
            <Link
              href="/admin/live-classes"
              className={cn(
                pressable,
                "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10"
              )}
            >
              <Broadcast size={16} weight="duotone" />
              Portal Classes
            </Link>
          </div>
        </div>
      </div>

      {/* Primary metrics — bento */}
      <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          href="/admin/enrollments"
          label="Total Registrations"
          value={data.totalEnrollments}
          hint="All-time submissions"
          icon={<ClipboardText size={22} weight="duotone" />}
          accent="from-rose-500 to-pink-600"
          glow="shadow-rose-500/20"
        />
        <MetricCard
          href="/admin/enrollments"
          label="Paid / Approved"
          value={data.approvedEnrollments}
          hint={data.trends.approved}
          icon={<Sparkle size={22} weight="duotone" />}
          accent="from-emerald-500 to-teal-600"
          glow="shadow-emerald-500/20"
          trend={data.trends.approved}
        />
        <MetricCard
          href="/admin/enrollments"
          label="Pending Review"
          value={data.pendingEnrollments}
          hint={data.trends.pending}
          icon={<ChartBar size={22} weight="duotone" />}
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
          icon={<GraduationCap size={22} weight="duotone" />}
          accent="from-amber-500 to-orange-600"
          glow="shadow-orange-500/20"
          trend={data.trends.students}
        />
      </div>

      {/* Spotlight row */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <SpotlightCard
          href="/admin/credentials"
          title="Portal Logins"
          icon={<Key size={24} weight="duotone" />}
          accent="from-violet-500 to-purple-700"
        >
          <div className="flex items-end gap-2">
            <span className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight text-white">
              <CountUp end={data.loggedInStudents} duration={1.2} separator="," />
            </span>
            <span className="text-xl font-medium text-white/50 pb-1">/ {data.students}</span>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs font-medium text-white/70">
              <span>Login rate</span>
              <span>{loginRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-1000"
                style={{ width: `${loginRate}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/50">
              {data.neverLoggedInStudents} students never logged in
            </p>
          </div>
        </SpotlightCard>

        <SpotlightCard
          href="/admin/courses"
          title="Live Content"
          icon={<VideoCamera size={24} weight="duotone" />}
          accent="from-cyan-500 to-blue-700"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-4xl sm:text-5xl font-bold tabular-nums text-white">
                <CountUp end={data.upcomingSessions} duration={1.2} />
              </p>
              <p className="mt-1 text-sm text-white/60">Upcoming classes</p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold tabular-nums text-white">
                <CountUp end={data.assignments} duration={1.2} />
              </p>
              <p className="mt-1 text-sm text-white/60">Live assignments</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-white/50">Manage materials, sessions & syllabus</p>
        </SpotlightCard>
      </div>

      {/* Bottom bento */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Analytics */}
        <div className="lg:col-span-3 rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-col min-h-0">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Student Mix</h2>
              <p className="text-xs text-zinc-500 mt-0.5">First-time vs returning registrations</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Analytics
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
            <DonutChart first={data.firstTimeRegistrations} returning={data.returningRegistrations} />
            <div className="flex-1 w-full space-y-4">
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

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 pt-5 border-t border-zinc-100">
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
                "mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/80 px-4 py-3 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              )}
            >
              <Lightning size={14} weight="fill" className="text-amber-600 shrink-0" />
              {data.missingTrainerAssignments} students need trainer sync
              <ArrowRight size={12} className="ml-auto" />
            </Link>
          )}
        </div>

        {/* Quick access */}
        <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-zinc-950 p-5 sm:p-6 shadow-sm flex flex-col min-h-0">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400/90">
              Quick Access
            </p>
            <h2 className="text-lg font-bold text-white mt-1">Jump in</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 content-start">
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
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
            accent,
            glow
          )}
        >
          {icon}
        </div>
        {pulse && (
          <span className="flex h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse shadow-lg shadow-sky-400/50" />
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900">
          <CountUp end={value} duration={1.2} separator="," />
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-700">{label}</p>
        <TrendLine text={trend ?? hint} />
      </div>
    </>
  );

  const className = cn(
    pressable,
    "group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm",
    "hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5"
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
        "group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        "bg-gradient-to-br text-white",
        accent
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/15 transition-colors"
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between gap-3 mb-4">
        <p className="text-sm font-semibold text-white/80">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <div className="relative">{children}</div>
      <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white/70 group-hover:text-white">
        Open <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </span>
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
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-sm font-semibold text-zinc-800">{label}</p>
        <p className="text-lg font-bold tabular-nums text-zinc-900">
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
        "rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3 text-center hover:bg-white hover:border-zinc-200 hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {icon}
        <p className="text-xl font-bold tabular-nums text-zinc-900">
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
        "group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] p-3.5",
        "hover:bg-white/[0.08] hover:border-white/15 hover:shadow-lg",
        accent
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">{title}</p>
        <p className="text-[11px] text-zinc-500 truncate">{subtitle}</p>
      </div>
      <ArrowRight
        size={14}
        className="shrink-0 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all"
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
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const firstLen = (firstPct / 100) * circumference;
  const returnLen = circumference - firstLen;

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90 drop-shadow-sm">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#f4f4f5" strokeWidth="12" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="url(#donutOrange)"
          strokeWidth="12"
          strokeDasharray={`${firstLen} ${returnLen}`}
          strokeLinecap="round"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="url(#donutGreen)"
          strokeWidth="12"
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
        <span className="text-2xl font-bold tabular-nums text-zinc-900">{total}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total</span>
      </div>
    </div>
  );
}
