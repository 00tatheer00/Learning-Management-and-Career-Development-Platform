"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChartLineUp,
  ClipboardText,
  GraduationCap,
  Key,
  Sparkle,
  Users,
  VideoCamera,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface AdminDashboardStats {
  pendingEnrollments: number;
  approvedEnrollments: number;
  totalEnrollments: number;
  students: number;
  trainerAssignedStudents: number;
  missingTrainerAssignments: number;
  returningRegistrations: number;
  assignments: number;
  upcomingSessions: number;
}

const pressable =
  "cursor-pointer transition-all duration-150 ease-out hover:scale-[1.02] active:scale-90 select-none";

interface AdminDashboardHomeProps {
  stats: AdminDashboardStats;
}

export function AdminDashboardHome({ stats }: AdminDashboardHomeProps) {
  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)] overflow-hidden">
      {/* Hero */}
      <div className="shrink-0 relative overflow-hidden rounded-2xl border border-orange-100/80 bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 px-4 py-3.5 sm:px-5 sm:py-4 shadow-lg shadow-orange-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.22)_0%,transparent_55%)]" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-semibold uppercase tracking-widest">
              <Sparkle size={12} weight="fill" />
              Command Center
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white mt-1 tracking-tight">
              Admin Overview
            </h1>
            <p className="text-xs text-white/75 mt-0.5 hidden sm:block">
              Registrations, students & portal at a glance
            </p>
          </div>
          <Link
            href="/admin/enrollments"
            className={cn(
              pressable,
              "inline-flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-orange-700 shadow-sm hover:bg-white hover:shadow-md shrink-0"
            )}
          >
            Review
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
        <MetricTile
          href="/admin/enrollments"
          label="Pending"
          value={stats.pendingEnrollments}
          hint="Awaiting approval"
          tone="amber"
          icon={<ClipboardText size={18} weight="duotone" />}
          highlight={stats.pendingEnrollments > 0}
        />
        <MetricTile
          href="/admin/enrollments"
          label="Paid"
          value={stats.approvedEnrollments}
          hint={
            stats.returningRegistrations > 0
              ? `${stats.returningRegistrations} returning`
              : "Approved registrations"
          }
          tone="emerald"
          icon={<ChartLineUp size={18} weight="duotone" />}
        />
        <MetricTile
          href="/admin/students"
          label="Students"
          value={stats.students}
          hint={
            stats.missingTrainerAssignments > 0
              ? `${stats.missingTrainerAssignments} need sync`
              : `${stats.trainerAssignedStudents} with trainer`
          }
          tone="blue"
          icon={<GraduationCap size={18} weight="duotone" />}
        />
        <MetricTile
          label="Total"
          value={stats.totalEnrollments}
          hint="All registrations"
          tone="slate"
          icon={<ClipboardText size={18} weight="duotone" />}
        />
        <MetricTile
          href="/admin/credentials"
          label="Portal Logins"
          value={stats.students}
          hint="Login accounts"
          tone="violet"
          icon={<Key size={18} weight="duotone" />}
        />
        <MetricTile
          href="/admin/courses"
          label="Classes"
          value={stats.upcomingSessions}
          hint={`${stats.assignments} assignments`}
          tone="teal"
          icon={<VideoCamera size={18} weight="duotone" />}
        />
      </div>

      {/* Alert */}
      {stats.pendingEnrollments > 0 && (
        <Link
          href="/admin/enrollments"
          className={cn(
            pressable,
            "shrink-0 mt-2 flex items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 shadow-sm hover:border-amber-300 hover:bg-amber-50"
          )}
        >
          <p className="text-xs font-semibold text-amber-900">
            {stats.pendingEnrollments} registration{stats.pendingEnrollments === 1 ? "" : "s"} need
            your review
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 shrink-0">
            Open
            <ArrowRight size={12} weight="bold" />
          </span>
        </Link>
      )}

      {/* Quick access */}
      <div className="flex-1 min-h-0 flex flex-col mt-3">
        <p className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted mb-2 px-0.5">
          Quick Access
        </p>
        <div className="flex-1 min-h-0 grid grid-cols-2 lg:grid-cols-3 gap-2 content-start">
          <NavTile
            href="/admin/enrollments"
            title="Registrations"
            subtitle="Approve applications"
            icon={<ClipboardText size={20} weight="duotone" />}
            gradient="from-orange-500 to-amber-500"
          />
          <NavTile
            href="/admin/students"
            title="Students"
            subtitle="Browse all accounts"
            icon={<GraduationCap size={20} weight="duotone" />}
            gradient="from-blue-500 to-indigo-500"
          />
          <NavTile
            href="/admin/credentials"
            title="Portal Logins"
            subtitle="IDs & passwords"
            icon={<Key size={20} weight="duotone" />}
            gradient="from-amber-500 to-orange-600"
          />
          <NavTile
            href="/admin/trainers"
            title="Trainers"
            subtitle="Manage trainers"
            icon={<Users size={20} weight="duotone" />}
            gradient="from-violet-500 to-purple-600"
          />
          <NavTile
            href="/admin/courses"
            title="Courses"
            subtitle="Materials & content"
            icon={<BookOpen size={20} weight="duotone" />}
            gradient="from-emerald-500 to-teal-600"
          />
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
  tone,
  icon,
  href,
  highlight,
}: {
  label: string;
  value: number;
  hint?: string;
  tone: "amber" | "emerald" | "blue" | "slate" | "violet" | "teal";
  icon: React.ReactNode;
  href?: string;
  highlight?: boolean;
}) {
  const tones = {
    amber: {
      wrap: "border-amber-100 bg-gradient-to-br from-amber-50 to-white hover:border-amber-200",
      icon: "bg-amber-500/10 text-amber-600",
      value: "text-amber-950",
    },
    emerald: {
      wrap: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-200",
      icon: "bg-emerald-500/10 text-emerald-600",
      value: "text-emerald-950",
    },
    blue: {
      wrap: "border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:border-blue-200",
      icon: "bg-blue-500/10 text-blue-600",
      value: "text-blue-950",
    },
    slate: {
      wrap: "border-zinc-100 bg-gradient-to-br from-zinc-50 to-white hover:border-zinc-200",
      icon: "bg-zinc-500/10 text-zinc-600",
      value: "text-zinc-950",
    },
    violet: {
      wrap: "border-violet-100 bg-gradient-to-br from-violet-50 to-white hover:border-violet-200",
      icon: "bg-violet-500/10 text-violet-600",
      value: "text-violet-950",
    },
    teal: {
      wrap: "border-teal-100 bg-gradient-to-br from-teal-50 to-white hover:border-teal-200",
      icon: "bg-teal-500/10 text-teal-600",
      value: "text-teal-950",
    },
  };

  const style = tones[tone];

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", style.icon)}>
          {icon}
        </div>
        {highlight && (
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0 mt-1" />
        )}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mt-2">{label}</p>
      <p className={cn("text-2xl font-bold tabular-nums tracking-tight leading-none mt-0.5", style.value)}>
        {value}
      </p>
      {hint && <p className="text-[10px] text-muted mt-1 line-clamp-1">{hint}</p>}
    </>
  );

  const baseClass = cn(
    "rounded-xl border p-2.5 shadow-sm text-left block",
    style.wrap,
    href && "shadow-sm hover:shadow-md"
  );

  if (href) {
    return (
      <Link href={href} className={cn(pressable, baseClass)}>
        {inner}
      </Link>
    );
  }

  return <div className={baseClass}>{inner}</div>;
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
        "group relative overflow-hidden rounded-xl border border-zinc-200/70 bg-white p-3 shadow-sm hover:border-orange-200/60 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            gradient
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {title}
          </p>
          <p className="text-[11px] text-muted truncate">{subtitle}</p>
        </div>
        <ArrowRight
          size={14}
          weight="bold"
          className="shrink-0 text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
        />
      </div>
    </Link>
  );
}
