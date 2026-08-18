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
  Sparkle,
} from "@phosphor-icons/react";
import type {
  AdminRevenueStats,
  AdminRevenuePhaseStats,
  AdminRevenueCourseStats,
} from "@/lib/api/admin-revenue";
import { usePortalThemeOptional } from "@/components/portal/portal-theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type RevenuePeriod = "all" | "week" | "month" | string;

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

function getPeriodStats(
  stats: AdminRevenuePhaseStats,
  period: RevenuePeriod,
  selectedPhase: "all" | "phase-1" | "phase-2"
) {
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
      label: "This month (August 2026)",
    };
  }
  if (stats.monthlyBreakdown && stats.monthlyBreakdown.length > 0) {
    const found = stats.monthlyBreakdown.find((m) => m.monthKey === period);
    if (found) {
      return {
        students: found.approvedCount,
        gross: found.gross,
        management: found.management,
        trainer: found.trainer,
        school: found.school,
        label: found.label,
      };
    }
  }
  return {
    students: stats.totalApproved,
    gross: stats.totalGross,
    management: stats.totalManagement,
    trainer: stats.totalTrainer,
    school: stats.totalSchool,
    label:
      selectedPhase === "phase-1"
        ? "Full Phase 1 (June – July 2026)"
        : selectedPhase === "phase-2"
          ? "Full Phase 2 (July – August 2026)"
          : "All Time (All Phases)",
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
  if (course.monthlyBreakdown && course.monthlyBreakdown.length > 0) {
    const found = course.monthlyBreakdown.find((m) => m.monthKey === period);
    if (found) {
      return {
        students: found.approvedCount,
        gross: found.gross,
        management: found.management,
        trainer: found.trainer,
        school: found.school,
      };
    }
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

  const handlePhaseChange = (phase: "all" | "phase-1" | "phase-2") => {
    setSelectedPhase(phase);
    // Auto-reset period to 'all' so Phase 1 data (PKR 207,000) is never masked by August's 'month' filter
    setPeriod("all");
  };

  if (!open) return null;

  const activeStats: AdminRevenuePhaseStats | null = stats
    ? selectedPhase === "phase-1"
      ? stats.phases?.phase1 ?? stats
      : selectedPhase === "phase-2"
        ? stats.phases?.phase2 ?? stats
        : stats
    : null;

  const periodStats = activeStats ? getPeriodStats(activeStats, period, selectedPhase) : null;

  // Build intelligent period options based on the active phase
  const getPeriodOptions = () => {
    if (!stats || !activeStats) return [];

    if (selectedPhase === "phase-1") {
      const options: Array<{ key: string; label: string }> = [
        { key: "all", label: `All Phase 1 (${stats.phases.phase1.totalApproved})` },
      ];
      if (stats.phases.phase1.monthlyBreakdown) {
        for (const m of stats.phases.phase1.monthlyBreakdown) {
          options.push({ key: m.monthKey, label: `${m.label.split(" ")[0]} (${m.approvedCount})` });
        }
      }
      return options;
    }

    if (selectedPhase === "phase-2") {
      const options: Array<{ key: string; label: string }> = [
        { key: "all", label: `All Phase 2 (${stats.phases.phase2.totalApproved})` },
        { key: "month", label: `August (${stats.phases.phase2.thisMonthApproved})` },
      ];
      if (stats.phases.phase2.monthlyBreakdown) {
        for (const m of stats.phases.phase2.monthlyBreakdown) {
          if (m.monthKey !== "2026-08") {
            options.push({ key: m.monthKey, label: `${m.label.split(" ")[0]} (${m.approvedCount})` });
          }
        }
      }
      options.push({ key: "week", label: `This week (${stats.phases.phase2.thisWeekApproved})` });
      return options;
    }

    // "all" phases
    return [
      { key: "all", label: `All time (${stats.totalApproved})` },
      { key: "month", label: `August (${stats.thisMonthApproved})` },
      { key: "week", label: `This week (${stats.thisWeekApproved})` },
    ];
  };

  const periodOptions = getPeriodOptions();

  // Filter courses for active phase (Phase 1 had only Web & App Dev, AI was 0)
  const coursesToDisplay = activeStats?.byCourse.filter((c) => {
    if (selectedPhase === "phase-1") {
      return c.approvedCount > 0;
    }
    return true;
  });

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
        className="relative flex h-full w-full max-w-[500px] flex-col bg-background shadow-2xl"
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
                    Financial Overview
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

            {/* Dynamic phase split explanation */}
            {selectedPhase === "phase-1" ? (
              <p className="text-xs text-indigo-100 leading-relaxed bg-indigo-950/40 border border-indigo-400/20 rounded-lg p-2">
                <span className="font-semibold text-white">Phase 1 Model:</span> PKR 1,000 → PKR 200 Mgmt (Komal) · PKR 800 Trainer (Tatheer / Talha) · PKR 0 School
              </p>
            ) : selectedPhase === "phase-2" ? (
              <p className="text-xs text-emerald-100 leading-relaxed bg-emerald-950/40 border border-emerald-400/20 rounded-lg p-2">
                <span className="font-semibold text-white">Phase 2 Model:</span> PKR 1,000 → PKR 200 Mgmt (Komal) · PKR 700 Trainer · PKR 100 School
              </p>
            ) : (
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                <span className="font-semibold text-white">Phase 1:</span> Rs 200 Mgmt / Rs 800 Trainer · <span className="font-semibold text-white">Phase 2:</span> Rs 200 Mgmt / Rs 700 Trainer / Rs 100 School
              </p>
            )}
          </div>
        </div>

        {/* Phase Filter Toggle Bar */}
        {stats && stats.phases && (
          <div className="shrink-0 border-b border-border bg-muted/20 px-4 py-2.5 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted shrink-0">
              Module Phase
            </span>
            <div className="flex gap-1 bg-secondary/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handlePhaseChange("all")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "all"
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-muted hover:text-foreground"
                )}
              >
                All ({stats.totalApproved})
              </button>
              <button
                type="button"
                onClick={() => handlePhaseChange("phase-1")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "phase-1"
                    ? "bg-indigo-600 text-white shadow-sm font-bold"
                    : "text-muted hover:text-foreground"
                )}
              >
                Phase 1 ({stats.phases.phase1.totalApproved})
              </button>
              <button
                type="button"
                onClick={() => handlePhaseChange("phase-2")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "phase-2"
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "text-muted hover:text-foreground"
                )}
              >
                Phase 2 ({stats.phases.phase2.totalApproved})
              </button>
            </div>
          </div>
        )}

        {/* Time Period Filter Bar */}
        <div className="shrink-0 border-b border-border px-4 py-2.5 flex gap-1.5 overflow-x-auto">
          {periodOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPeriod(opt.key)}
              className={cn(
                "flex-1 min-w-[70px] rounded-xl py-2 px-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap text-center",
                period === opt.key
                  ? selectedPhase === "phase-1"
                    ? "bg-indigo-600 text-white shadow-sm font-bold"
                    : "bg-emerald-600 text-white shadow-sm font-bold"
                  : "bg-secondary text-muted hover:text-foreground"
              )}
            >
              {opt.label}
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
              {/* Gross Revenue Hero Card */}
              <div
                className={cn(
                  "rounded-2xl p-5 shadow-sm border",
                  selectedPhase === "phase-1"
                    ? "bg-indigo-50/80 border-indigo-200/80 dark:bg-indigo-950/20 dark:border-indigo-800/40"
                    : "portal-callout-emerald"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 mb-1 font-bold text-xs uppercase tracking-wider",
                    selectedPhase === "phase-1"
                      ? "text-indigo-700 dark:text-indigo-400"
                      : "text-emerald-700"
                  )}
                >
                  <TrendUp size={16} weight="duotone" />
                  <p>{periodStats.label} — gross collected</p>
                </div>
                <p
                  className={cn(
                    "text-3xl font-bold tracking-tight",
                    selectedPhase === "phase-1"
                      ? "text-indigo-950 dark:text-indigo-100"
                      : "text-emerald-950"
                  )}
                >
                  {formatMoney(periodStats.gross, stats.currency)}
                </p>
                <p
                  className={cn(
                    "text-sm mt-1 font-medium",
                    selectedPhase === "phase-1"
                      ? "text-indigo-800/80 dark:text-indigo-300/80"
                      : "text-emerald-800/70"
                  )}
                >
                  {periodStats.students} verified paid registration
                  {periodStats.students === 1 ? "" : "s"}
                </p>
              </div>

              {/* 3 Share Cards (Management, Trainers, School) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-background p-3.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-400 mb-1.5">
                    <Buildings size={15} weight="duotone" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Komal (Mgmt)</p>
                  </div>
                  <p className="text-lg font-bold text-violet-950 dark:text-violet-100">
                    {formatMoney(periodStats.management, stats.currency)}
                  </p>
                  <p className="text-[10px] text-violet-600 dark:text-violet-400 mt-0.5">
                    Rs 200 / student
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background p-3.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 mb-1.5">
                    <GraduationCap size={15} weight="duotone" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Trainers</p>
                  </div>
                  <p className="text-lg font-bold text-blue-950 dark:text-blue-100">
                    {formatMoney(periodStats.trainer, stats.currency)}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                    {selectedPhase === "phase-1" ? "Rs 800 / student" : "Rs 700 / student"}
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-2xl border p-3.5 shadow-xs bg-gradient-to-br",
                    selectedPhase === "phase-1"
                      ? "border-slate-200/70 from-slate-50 to-white dark:from-slate-900/40 dark:to-background opacity-75"
                      : "border-emerald-200/70 from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5 mb-1.5",
                      selectedPhase === "phase-1"
                        ? "text-slate-600 dark:text-slate-400"
                        : "text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    <Buildings size={15} weight="duotone" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">School %</p>
                  </div>
                  <p
                    className={cn(
                      "text-lg font-bold",
                      selectedPhase === "phase-1"
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-emerald-950 dark:text-emerald-100"
                    )}
                  >
                    {formatMoney(periodStats.school, stats.currency)}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {selectedPhase === "phase-1" ? "Rs 0 (Phase 1 model)" : "Rs 100 / student"}
                  </p>
                </div>
              </div>

              {/* Distribution Bar */}
              {periodStats.gross > 0 && (
                <div className="rounded-xl border border-border bg-secondary/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                    Revenue Distribution
                  </p>
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 gap-0.5">
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
                    <span className="text-violet-700 dark:text-violet-400 font-medium">
                      Management {Math.round((periodStats.management / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-blue-700 dark:text-blue-400 font-medium">
                      Trainers {Math.round((periodStats.trainer / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      School {Math.round((periodStats.school / periodStats.gross) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Course-wise Breakdown */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3 px-0.5">
                  Course-wise breakdown
                </p>
                <div className="space-y-3">
                  {coursesToDisplay?.map((course) => {
                    const cp = getCoursePeriodStats(course, period);
                    const trainerShort = course.trainerName.split(" ").slice(-1)[0];
                    return (
                      <div
                        key={course.programSlug}
                        className="rounded-2xl border border-border overflow-hidden bg-background shadow-xs"
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
                                {period === "all" ? "unique students" : "registrations"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted font-medium">Gross collected</span>
                            <span className="font-bold text-foreground text-base">
                              {formatMoney(cp.gross, stats.currency)}
                            </span>
                          </div>
                          <div className="h-px bg-border" />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 p-2 text-center">
                              <p className="text-[9px] font-bold uppercase text-violet-600 dark:text-violet-400">
                                Management
                              </p>
                              <p className="text-xs font-bold text-violet-950 dark:text-violet-200 mt-0.5">
                                {formatMoney(cp.management, stats.currency)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-2 text-center">
                              <p className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400">
                                {trainerShort}
                              </p>
                              <p className="text-xs font-bold text-blue-950 dark:text-blue-200 mt-0.5">
                                {formatMoney(cp.trainer, stats.currency)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-2 text-center">
                              <p className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                School
                              </p>
                              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 mt-0.5">
                                {formatMoney(cp.school, stats.currency)}
                              </p>
                            </div>
                          </div>

                          {period === "all" && course.approvedCount !== course.uniqueStudents && (
                            <p className="text-xs portal-callout-amber rounded-lg px-3 py-2">
                              {course.approvedCount} paid registration
                              {course.approvedCount === 1 ? "" : "s"} (
                              {course.approvedCount - course.uniqueStudents} returning / repeat enrollments)
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

                  {/* Phase 1 AI Notice */}
                  {selectedPhase === "phase-1" && (
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-3 text-center bg-slate-50/50 dark:bg-slate-900/20">
                      <p className="text-xs text-muted font-medium flex items-center justify-center gap-1.5">
                        <Sparkle size={14} className="text-purple-500" />
                        Artificial Intelligence program was launched in Phase 2
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
