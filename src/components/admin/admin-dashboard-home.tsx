"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CountUp from "react-countup";
import {
  ArrowRight,
  ChartBar,
  ClipboardText,
  GraduationCap,
  Key,
  TrendDown,
  TrendUp,
  VideoCamera,
} from "@phosphor-icons/react";
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";
import type { AdminDashboardData } from "@/lib/api/admin-dashboard";
import { cn } from "@/lib/utils";

const pressable = "cursor-pointer select-none";

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
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-800">{error ?? "Something went wrong"}</p>
        <button
          type="button"
          onClick={() => void load()}
          className={cn(pressable, "mt-3 text-sm font-semibold text-red-700 underline")}
        >
          Try again
        </button>
      </div>
    );
  }

  return <AdminDashboardHome data={data} />;
}

function AdminDashboardHome({ data }: { data: AdminDashboardData }) {
  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)] overflow-hidden gap-3">
      {/* Title row */}
      <div className="shrink-0 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Overview</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        </div>
        {data.pendingEnrollments > 0 && (
          <Link
            href="/admin/enrollments"
            className={cn(
              pressable,
              "inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm"
            )}
          >
            {data.pendingEnrollments} pending
            <ArrowRight size={12} weight="bold" />
          </Link>
        )}
      </div>

      {/* Row 1 — pastel summary cards */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          href="/admin/enrollments"
          label="Total Registrations"
          value={data.totalEnrollments}
          trend="All time submissions"
          tone="rose"
          icon={<ClipboardText size={18} weight="duotone" />}
        />
        <SummaryCard
          href="/admin/enrollments"
          label="Paid / Approved"
          value={data.approvedEnrollments}
          trend={data.trends.approved}
          tone="emerald"
          icon={<ChartBar size={18} weight="duotone" />}
        />
        <SummaryCard
          href="/admin/enrollments"
          label="Pending Review"
          value={data.pendingEnrollments}
          trend={data.trends.pending}
          tone="sky"
          icon={<ClipboardText size={18} weight="duotone" />}
          pulse={data.pendingEnrollments > 0}
        />
        <SummaryCard
          href="/admin/students"
          label="Active Students"
          value={data.students}
          trend={data.trends.students}
          tone="amber"
          icon={<GraduationCap size={18} weight="duotone" />}
        />
      </div>

      {/* Row 2 — detail cards */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3">
        <DetailCard
          href="/admin/credentials"
          label="Portal Logins"
          value={data.loggedInStudents}
          suffix={` / ${data.students}`}
          trend={`${data.neverLoggedInStudents} never logged in`}
          icon={<Key size={22} weight="duotone" />}
        />
        <DetailCard
          href="/admin/courses"
          label="Upcoming Classes"
          value={data.upcomingSessions}
          trend={`${data.assignments} assignments live`}
          icon={<VideoCamera size={22} weight="duotone" />}
        />
      </div>

      {/* Row 3 — overview + quick access */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm flex flex-col justify-between min-h-0">
          <div className="shrink-0 mb-3">
            <h2 className="text-base font-bold text-foreground">Overall Information</h2>
            <p className="text-xs text-muted mt-0.5">Portal & program breakdown</p>
          </div>

          <div className="flex items-center gap-4 flex-1 py-2">
            <DonutChart first={data.firstTimeRegistrations} returning={data.returningRegistrations} />
            <div className="flex-1 space-y-3 min-w-0">
              <OverviewStat
                label="First-time"
                value={data.firstTimeRegistrations}
                badge={data.trends.approved}
                positive
              />
              <OverviewStat
                label="Returning"
                value={data.returningRegistrations}
                badge={`${data.returningRegistrations} re-enrolled`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto pt-3 shrink-0">
            <MiniStat label="Trainers" value={data.trainers} href="/admin/trainers" />
            <MiniStat label="Web" value={data.webStudents} href="/admin/students" />
            <MiniStat label="App" value={data.appStudents} href="/admin/students" />
          </div>

          {data.missingTrainerAssignments > 0 && (
            <Link
              href="/admin/settings"
              className={cn(
                pressable,
                "mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] font-semibold text-amber-900"
              )}
            >
              {data.missingTrainerAssignments} students need trainer sync →
            </Link>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm flex flex-col min-h-0">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Quick Access</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 content-stretch">
            <NavTile href="/admin/enrollments" title="Registrations" subtitle="Approve applications" icon={<ClipboardText size={20} weight="duotone" />} gradient="from-orange-500 to-amber-500" />
            <NavTile href="/admin/students" title="Students" subtitle="All accounts" icon={<GraduationCap size={20} weight="duotone" />} gradient="from-blue-500 to-indigo-500" />
            <NavTile href="/admin/credentials" title="Portal Logins" subtitle="IDs & passwords" icon={<Key size={20} weight="duotone" />} gradient="from-amber-500 to-orange-600" />
            <NavTile href="/admin/trainers" title="Trainers" subtitle="Manage trainers" icon={<ChartBar size={20} weight="duotone" />} gradient="from-violet-500 to-purple-600" />
            <NavTile href="/admin/courses" title="Courses" subtitle="Materials" icon={<VideoCamera size={20} weight="duotone" />} gradient="from-emerald-500 to-teal-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  trend,
  tone,
  icon,
  href,
  pulse,
}: {
  label: string;
  value: number;
  trend: string;
  tone: "rose" | "emerald" | "sky" | "amber";
  icon: React.ReactNode;
  href?: string;
  pulse?: boolean;
}) {
  const tones = {
    rose: { bg: "bg-rose-50", icon: "bg-rose-500 text-white", text: "text-rose-700" },
    emerald: { bg: "bg-emerald-50", icon: "bg-emerald-500 text-white", text: "text-emerald-700" },
    sky: { bg: "bg-sky-50", icon: "bg-sky-500 text-white", text: "text-sky-700" },
    amber: { bg: "bg-amber-50", icon: "bg-amber-500 text-white", text: "text-amber-700" },
  };
  const t = tones[tone];

  const inner = (
    <>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", t.icon)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted truncate">{label}</p>
          <p className={cn("text-2xl font-bold tabular-nums leading-tight", t.text)}>
            <CountUp end={value} duration={1.2} separator="," />
          </p>
        </div>
        {pulse && <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse shrink-0" />}
      </div>
      <TrendLine text={trend} />
    </>
  );

  const className = cn("rounded-xl border border-zinc-100 p-3.5 block", t.bg);

  if (href) {
    return (
      <Link href={href} className={cn(pressable, className, "hover:shadow-sm")}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}

function DetailCard({
  label,
  value,
  prefix = "",
  suffix = "",
  trend,
  icon,
  href,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm hover:border-orange-200/60 hover:shadow-md block h-full"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {prefix}
            <CountUp end={value} duration={1.2} separator="," />
            {suffix && <span className="text-lg font-semibold text-muted">{suffix}</span>}
          </p>
          <p className="text-sm text-muted mt-1">{label}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 text-muted bg-zinc-50">
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
        <TrendLine text={trend} small />
        <span className="text-xs font-semibold text-primary underline underline-offset-2">View</span>
      </div>
    </Link>
  );
}

function TrendLine({ text, small }: { text: string; small?: boolean }) {
  const isPositive = text.startsWith("+");
  const isNegative = text.startsWith("-");
  const isNeutral = !isPositive && !isNegative;

  return (
    <p
      className={cn(
        "flex items-center gap-1 mt-2 text-[10px]",
        small && "mt-0",
        isNegative ? "text-red-600" : isPositive ? "text-emerald-600" : "text-muted"
      )}
    >
      {isPositive && <TrendUp size={11} weight="bold" />}
      {isNegative && <TrendDown size={11} weight="bold" />}
      {isNeutral ? text : text}
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
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#f4f4f5" strokeWidth="10" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#fb923c"
          strokeWidth="10"
          strokeDasharray={`${firstLen} ${returnLen}`}
          strokeLinecap="round"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth="10"
          strokeDasharray={`${returnLen} ${firstLen}`}
          strokeDashoffset={-firstLen}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold tabular-nums">{total}</span>
        <span className="text-[9px] text-muted uppercase">Total</span>
      </div>
    </div>
  );
}

function OverviewStat({
  label,
  value,
  badge,
  positive,
}: {
  label: string;
  value: number;
  badge: string;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-base font-bold tabular-nums">
        <CountUp end={value} duration={1} separator="," />{" "}
        <span className="text-[11px] font-medium text-muted">{label}</span>
      </p>
      <span
        className={cn(
          "inline-block mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold",
          positive ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
        )}
      >
        {badge}
      </span>
    </div>
  );
}

function MiniStat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3 text-center hover:bg-white hover:border-zinc-200"
      )}
    >
      <p className="text-lg font-bold tabular-nums leading-none">
        <CountUp end={value} duration={1} />
      </p>
      <p className="text-[10px] text-muted mt-1 font-medium">{label}</p>
    </Link>
  );
}

function NavTile({
  href,
  title,
  subtitle,
  icon,
  gradient,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        pressable,
        "group flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-white p-3.5 hover:border-orange-200/60 hover:shadow-sm h-full min-h-[4.5rem]"
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
          gradient
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary truncate">{title}</p>
        <p className="text-xs text-muted truncate mt-0.5">{subtitle}</p>
      </div>
    </Link>
  );
}
