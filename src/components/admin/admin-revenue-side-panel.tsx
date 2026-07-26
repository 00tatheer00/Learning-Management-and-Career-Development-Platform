"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  CurrencyCircleDollar,
  X,
  ArrowClockwise,
  TrendUp,
  Buildings,
  GraduationCap,
  CaretRight,
} from "@phosphor-icons/react";
import type { AdminRevenueStats } from "@/lib/api/admin-revenue";
import { usePortalThemeOptional } from "@/components/portal/portal-theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type RevenuePeriod = "all" | "week" | "month";

interface AdminRevenueContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  stats: AdminRevenueStats | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AdminRevenueContext = createContext<AdminRevenueContextValue | null>(null);

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-PK")}`;
}

function getPeriodStats(stats: AdminRevenuePhaseStats, period: RevenuePeriod) {
  if (period === "week") {
    return {
      students: stats.thisWeekApproved,
      gross: stats.thisWeekGross,
      management: stats.thisWeekManagement,
      trainer: stats.thisWeekTrainer,
      school: stats.thisWeekSchool,
      label: "This week",
    };
  }
  if (period === "month") {
    return {
      students: stats.thisMonthApproved,
      gross: stats.thisMonthGross,
      management: stats.thisMonthManagement,
      trainer: stats.thisMonthTrainer,
      school: stats.thisMonthSchool,
      label: "This month",
    };
  }
  return {
    students: stats.totalApproved,
    gross: stats.totalGross,
    management: stats.totalManagement,
    trainer: stats.totalTrainer,
    school: stats.totalSchool,
    label: "All time",
  };
}

function getCoursePeriodStats(
  course: AdminRevenueCourseStats,
  period: RevenuePeriod
) {
  if (period === "week") {
    return {
      students: course.thisWeekCount,
      gross: course.thisWeekGross,
      management: course.thisWeekManagement,
      trainer: course.thisWeekTrainer,
      school: course.thisWeekSchool,
    };
  }
  if (period === "month") {
    return {
      students: course.thisMonthCount,
      gross: course.thisMonthGross,
      management: course.thisMonthManagement,
      trainer: course.thisMonthTrainer,
      school: course.thisMonthSchool,
    };
  }
  return {
    students: course.approvedCount,
    gross: course.gross,
    management: course.managementShare,
    trainer: course.trainerShare,
    school: course.schoolShare,
  };
}

export function AdminRevenueProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<AdminRevenueStats | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/revenue");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !stats && !loading) {
      void refresh();
    }
  }, [open, stats, loading, refresh]);

  return (
    <AdminRevenueContext.Provider value={{ open, setOpen, stats, loading, refresh }}>
      {children}
      <AdminRevenueSidePanel />
    </AdminRevenueContext.Provider>
  );
}

export function useAdminRevenue() {
  const ctx = useContext(AdminRevenueContext);
  if (!ctx) throw new Error("useAdminRevenue must be used within AdminRevenueProvider");
  return ctx;
}

export function useAdminRevenueOptional() {
  return useContext(AdminRevenueContext);
}

export function AdminRevenueHeaderButton() {
  const ctx = useAdminRevenueOptional();
  if (!ctx) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => ctx.setOpen(true)}
      className="gap-2 portal-revenue-trigger hover:opacity-95"
    >
      <CurrencyCircleDollar size={18} weight="duotone" />
      <span className="hidden sm:inline">Revenue</span>
    </Button>
  );
}

export function AdminRevenueSidebarCard({
  compact = false,
  dark: darkProp = false,
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  const ctx = useAdminRevenueOptional();
  const portalTheme = usePortalThemeOptional();
  const dark = darkProp || Boolean(portalTheme?.isDark);
  if (!ctx) return null;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => ctx.setOpen(true)}
        title="Registration Revenue"
        aria-label="Open registration revenue panel"
        className={cn(
          "mx-auto flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ease-out cursor-pointer select-none",
          dark
            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            : "border border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
        )}
      >
        <CurrencyCircleDollar size={18} weight="duotone" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(true)}
      className={cn(
        "w-full rounded-lg p-2.5 text-left transition-colors duration-150 ease-out cursor-pointer select-none group",
        dark
          ? "border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/15"
          : "portal-revenue-trigger hover:opacity-95"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-600 text-white"
          )}
        >
          <CurrencyCircleDollar size={15} weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider",
              dark ? "text-emerald-500/80" : "text-emerald-800"
            )}
          >
            Revenue
          </p>
          <p
            className={cn(
              "text-xs font-semibold truncate",
              dark ? "text-emerald-300" : "text-emerald-950"
            )}
          >
            Open panel
          </p>
        </div>
      </div>
    </button>
  );
}

function AdminRevenueSidePanel() {
  const { open, setOpen, stats, loading, refresh } = useAdminRevenue();
  const [period, setPeriod] = useState<RevenuePeriod>("all");
  const [selectedPhase, setSelectedPhase] = useState<"all" | "phase-1" | "phase-2">("all");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  const activeStats: AdminRevenuePhaseStats | null = stats
    ? selectedPhase === "phase-1"
      ? stats.phases?.phase1 ?? stats
      : selectedPhase === "phase-2"
        ? stats.phases?.phase2 ?? stats
        : stats
    : null;

  const periodStats = activeStats ? getPeriodStats(activeStats, period) : null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close revenue panel"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Registration Revenue"
        className="relative flex h-full w-full max-w-[480px] flex-col bg-background shadow-2xl"
      >
        <div className="relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
          <div className="relative px-5 pt-5 pb-5 text-white">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                  <CurrencyCircleDollar size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-200/90">
                    Business Overview
                  </p>
                  <h2 className="text-lg font-bold">Registration Revenue</h2>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={loading}
                  className="rounded-lg p-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                  aria-label="Refresh"
                >
                  <ArrowClockwise size={18} className={loading ? "animate-spin" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
            </div>

            {stats && (
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                <span className="font-semibold text-white">Phase 2 Split:</span> AI (Rs 2k → Rs 200 Mgmt, Rs 1,200 Trainer, Rs 600 School) · App Dev (Rs 1k → Rs 200 Mgmt, Rs 700 Trainer, Rs 100 School)
              </p>
            )}
          </div>
        </div>

        {/* Phase Filter Toggle Bar */}
        {stats && stats.phases && (
          <div className="shrink-0 border-b border-border bg-muted/20 px-4 py-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted shrink-0">
              Module Phase
            </span>
            <div className="flex gap-1 bg-secondary/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedPhase("all")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                All ({stats.totalApproved})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPhase("phase-1")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "phase-1"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                Phase 1 ({stats.phases.phase1.totalApproved})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPhase("phase-2")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "phase-2"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                )}
              >
                Phase 2 ({stats.phases.phase2.totalApproved})
              </button>
            </div>
          </div>
        )}

        {/* Time Period Filter Bar */}
        <div className="shrink-0 border-b border-border px-4 py-3 flex gap-2">
          {(
            [
              ["all", "All time"],
              ["week", "This week"],
              ["month", "This month"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={cn(
                "flex-1 rounded-xl py-2 text-xs font-semibold transition-all cursor-pointer",
                period === key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-secondary text-muted hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading && !stats && (
            <div className="flex flex-col items-center justify-center py-16 text-muted">
              <ArrowClockwise size={28} className="animate-spin mb-3 opacity-50" />
              <p className="text-sm">Loading revenue data…</p>
            </div>
          )}

          {stats && periodStats && (
            <>
              <div className="rounded-2xl portal-callout-emerald p-5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <TrendUp size={16} weight="duotone" />
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {periodStats.label} — gross collected
                  </p>
                </div>
                <p className="text-3xl font-bold text-emerald-950 tracking-tight">
                  {formatMoney(periodStats.gross, stats.currency)}
                </p>
                <p className="text-sm text-emerald-800/70 mt-1">
                  {periodStats.students} paid registration
                  {periodStats.students === 1 ? "" : "s"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50 to-white p-3.5">
                  <div className="flex items-center gap-1.5 text-violet-700 mb-1.5">
                    <Buildings size={15} weight="duotone" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Komal (Mgmt)</p>
                  </div>
                  <p className="text-lg font-bold text-violet-950">
                    {formatMoney(periodStats.management, stats.currency)}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-white p-3.5">
                  <div className="flex items-center gap-1.5 text-blue-700 mb-1.5">
                    <GraduationCap size={15} weight="duotone" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Trainers</p>
                  </div>
                  <p className="text-lg font-bold text-blue-950">
                    {formatMoney(periodStats.trainer, stats.currency)}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white p-3.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 mb-1.5">
                    <Buildings size={15} weight="duotone" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">School %</p>
                  </div>
                  <p className="text-lg font-bold text-emerald-950">
                    {formatMoney(periodStats.school, stats.currency)}
                  </p>
                </div>
              </div>

              {periodStats.gross > 0 && (
                <div className="rounded-xl border border-border bg-secondary/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                    Revenue Distribution
                  </p>
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 gap-0.5">
                    {periodStats.management > 0 && (
                      <div
                        className="bg-violet-500 transition-all"
                        style={{
                          width: `${(periodStats.management / periodStats.gross) * 100}%`,
                        }}
                      />
                    )}
                    {periodStats.trainer > 0 && (
                      <div
                        className="bg-blue-500 transition-all"
                        style={{
                          width: `${(periodStats.trainer / periodStats.gross) * 100}%`,
                        }}
                      />
                    )}
                    {periodStats.school > 0 && (
                      <div
                        className="bg-emerald-500 transition-all"
                        style={{
                          width: `${(periodStats.school / periodStats.gross) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap justify-between gap-1 mt-2 text-[11px] text-muted">
                    <span className="text-violet-700 font-medium">
                      Management {Math.round((periodStats.management / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-blue-700 font-medium">
                      Trainer {Math.round((periodStats.trainer / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-emerald-700 font-medium">
                      School {Math.round((periodStats.school / periodStats.gross) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3 px-0.5">
                  Course-wise breakdown
                </p>
                <div className="space-y-3">
                  {activeStats.byCourse.map((course) => {
                    const cp = getCoursePeriodStats(course, period);
                    const trainerShort = course.trainerName.split(" ").slice(-1)[0];
                    return (
                      <div
                        key={course.programSlug}
                        className="rounded-2xl border border-border overflow-hidden bg-background shadow-sm"
                      >
                        <div
                          className={cn(
                            "px-4 py-3 bg-gradient-to-r text-white",
                            course.headerGradient
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-sm">{course.courseTitle}</p>
                              <p className="text-xs text-white/80 mt-0.5">
                                Trainer: {course.trainerName}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-lg font-bold">
                                {period === "all" ? course.uniqueStudents : cp.students}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-white/75">
                                {period === "all" ? "portal students" : "registrations"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted">Gross collected</span>
                            <span className="font-bold text-foreground">
                              {formatMoney(cp.gross, stats.currency)}
                            </span>
                          </div>
                          <div className="h-px bg-border" />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-violet-50 border border-violet-100 p-2 text-center">
                              <p className="text-[9px] font-bold uppercase text-violet-600">
                                Management
                              </p>
                              <p className="text-xs font-bold text-violet-900 mt-0.5">
                                {formatMoney(cp.management, stats.currency)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-blue-50 border border-blue-100 p-2 text-center">
                              <p className="text-[9px] font-bold uppercase text-blue-600">
                                {trainerShort}
                              </p>
                              <p className="text-xs font-bold text-blue-900 mt-0.5">
                                {formatMoney(cp.trainer, stats.currency)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2 text-center">
                              <p className="text-[9px] font-bold uppercase text-emerald-600">
                                School
                              </p>
                              <p className="text-xs font-bold text-emerald-900 mt-0.5">
                                {formatMoney(cp.school, stats.currency)}
                              </p>
                            </div>
                          </div>
                          {period === "all" && course.approvedCount !== course.uniqueStudents && (
                            <p className="text-xs portal-callout-amber rounded-lg px-3 py-2">
                              {course.approvedCount} paid registration
                              {course.approvedCount === 1 ? "" : "s"} (
                              {course.approvedCount - course.uniqueStudents} returning)
                            </p>
                          )}
                          {period === "all" && course.thisWeekCount > 0 && (
                            <p className="text-xs portal-callout-emerald rounded-lg px-3 py-2">
                              +{course.thisWeekCount} this week (
                              {formatMoney(course.thisWeekGross, stats.currency)} gross)
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

