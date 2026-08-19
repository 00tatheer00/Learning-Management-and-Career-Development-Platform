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
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  const ctx = useAdminRevenueOptional();
  if (!ctx) return null;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => ctx.setOpen(true)}
        title="Revenue"
        aria-label="Open revenue panel"
        className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ease-out cursor-pointer select-none border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
      >
        <CurrencyCircleDollar size={20} weight="duotone" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(true)}
      className="w-full rounded-xl p-2.5 text-left transition-all duration-150 ease-out cursor-pointer select-none group border border-pt-subtle bg-pt-surface/80 hover:bg-pt-surface hover:border-emerald-500/50 shadow-pt text-pt"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs portal-tone-icon portal-tone-icon-emerald group-hover:scale-105 transition-transform">
          <CurrencyCircleDollar size={18} weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-pt tracking-tight">
              Revenue
            </p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              PKR
            </span>
          </div>
          <p className="text-[11px] font-medium text-pt-muted truncate">
            Financial Overview
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
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setOpen(false)}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Registration Revenue"
        className="relative flex h-full w-full max-w-[530px] flex-col bg-[#0c1017] text-slate-100 shadow-2xl border-l border-slate-800 z-10"
      >
        {/* Top Header Card */}
        <div className="relative shrink-0 border-b border-pt-subtle bg-pt-surface px-5 pt-5 pb-5 text-pt">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl portal-tone-icon portal-tone-icon-emerald shadow-xs">
                <CurrencyCircleDollar size={26} weight="duotone" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Financial Overview
                </p>
                <h2 className="text-xl font-bold tracking-tight text-pt">Registration Revenue</h2>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={loading}
                className="rounded-lg p-2 text-pt-muted hover:text-pt hover:bg-pt-surface/80 transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Refresh data"
              >
                <ArrowClockwise size={18} className={loading ? "animate-spin text-emerald-500" : ""} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-pt-muted hover:text-pt hover:bg-pt-surface/80 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
          </div>

          {/* Dynamic phase split explanation styled like dashboard tones */}
          {selectedPhase === "phase-1" ? (
            <div className="portal-tone-indigo text-xs text-pt leading-relaxed border border-pt-subtle rounded-xl p-3 shadow-pt">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase text-[10px] tracking-wider bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-md mr-2">
                Phase 1 Model
              </span>
              PKR 1,000 → <strong className="text-pt">PKR 200</strong> Mgmt (Komal) · <strong className="text-pt">PKR 800</strong> Trainer (Tatheer / Talha) · <strong className="text-pt">PKR 0</strong> School
            </div>
          ) : selectedPhase === "phase-2" ? (
            <div className="portal-tone-emerald text-xs text-pt leading-relaxed border border-pt-subtle rounded-xl p-3 shadow-pt">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase text-[10px] tracking-wider bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md mr-2">
                Phase 2 Model
              </span>
              PKR 1,000 → <strong className="text-pt">PKR 200</strong> Mgmt (Komal) · <strong className="text-pt">PKR 700</strong> Trainer · <strong className="text-pt">PKR 100</strong> School
            </div>
          ) : (
            <div className="portal-tone-slate text-xs text-pt-secondary leading-relaxed border border-pt-subtle rounded-xl p-3 shadow-pt">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Phase 1:</span> Rs 200 Mgmt / Rs 800 Trainer · <span className="font-bold text-emerald-600 dark:text-emerald-400">Phase 2:</span> Rs 200 Mgmt / Rs 700 Trainer / Rs 100 School
            </div>
          )}
        </div>

        {/* Phase Filter Toggle Bar */}
        {stats && stats.phases && (
          <div className="shrink-0 border-b border-pt-subtle bg-pt-surface/70 px-4 py-2.5 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pt-muted shrink-0">
              Module Phase
            </span>
            <div className="flex gap-1.5 bg-pt-surface border border-pt-subtle p-1 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => handlePhaseChange("all")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "all"
                    ? "bg-slate-800 text-white shadow-sm font-bold dark:bg-slate-700"
                    : "text-pt-muted hover:text-pt hover:bg-pt-surface/60"
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
                    : "text-pt-muted hover:text-pt hover:bg-pt-surface/60"
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
                    : "text-pt-muted hover:text-pt hover:bg-pt-surface/60"
                )}
              >
                Phase 2 ({stats.phases.phase2.totalApproved})
              </button>
            </div>
          </div>
        )}

        {/* Time Period Filter Bar */}
        <div className="shrink-0 border-b border-pt-subtle bg-pt-surface px-4 py-2.5 flex gap-2 overflow-x-auto">
          {periodOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPeriod(opt.key)}
              className={cn(
                "flex-1 min-w-[80px] rounded-xl py-2 px-2.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap text-center border",
                period === opt.key
                  ? selectedPhase === "phase-1"
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-sm font-bold"
                    : "bg-emerald-600 text-white border-emerald-700 shadow-sm font-bold"
                  : "bg-pt-surface/60 border-pt-subtle text-pt-muted hover:text-pt hover:bg-pt-surface"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading && !stats && (
            <div className="flex flex-col items-center justify-center py-16 text-pt-muted">
              <ArrowClockwise size={32} className="animate-spin mb-3 text-emerald-500" />
              <p className="text-sm font-medium">Loading revenue data…</p>
            </div>
          )}

          {stats && periodStats && (
            <>
              {/* Gross Revenue Hero Card — Styled exactly like main dashboard Phase 1 / Phase 2 cards */}
              <div
                className={cn(
                  "rounded-2xl p-5 border shadow-pt transition-all",
                  selectedPhase === "phase-1"
                    ? "portal-tone-indigo"
                    : selectedPhase === "phase-2"
                      ? "portal-tone-emerald"
                      : "portal-tone-slate"
                )}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs portal-tone-icon",
                        selectedPhase === "phase-1"
                          ? "portal-tone-icon-indigo"
                          : selectedPhase === "phase-2"
                            ? "portal-tone-icon-emerald"
                            : "portal-tone-icon-slate"
                      )}
                    >
                      {selectedPhase === "phase-1" ? "P1" : selectedPhase === "phase-2" ? "P2" : "ALL"}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-pt">
                        {periodStats.label}
                      </h3>
                      <p className="text-xs text-pt-muted">Gross Revenue Collection</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-extrabold border shadow-sm",
                      selectedPhase === "phase-1"
                        ? "bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-700"
                        : selectedPhase === "phase-2"
                          ? "bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700"
                          : "bg-slate-100 text-slate-950 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                    )}
                  >
                    {periodStats.students} Paid Registrations
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl border border-pt-subtle bg-pt-surface/80 text-center mb-3">
                  <div>
                    <p className="text-lg font-semibold tabular-nums text-pt">
                      {periodStats.students}
                    </p>
                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Approved</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold tabular-nums text-pt">0</p>
                    <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Pending</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold tabular-nums text-pt">
                      {selectedPhase === "phase-1" ? (stats.phases.phase1.students ?? periodStats.students) : (stats.phases.phase2.students ?? periodStats.students)}
                    </p>
                    <p className="text-[11px] font-medium text-pt-secondary">Active Students</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-pt-muted pt-1">
                  <span>Gross Collected</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {formatMoney(periodStats.gross, stats.currency)}
                  </span>
                </div>
              </div>

              {/* 3 Share Cards (Management, Trainers, School) — Styled like main dashboard metric cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Management Card */}
                <div className="portal-tone-violet rounded-2xl border border-pt-subtle p-3.5 shadow-pt">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg portal-tone-icon portal-tone-icon-violet">
                      <Buildings size={15} weight="duotone" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                      Komal (Mgmt)
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-pt tabular-nums">
                    {formatMoney(periodStats.management, stats.currency)}
                  </p>
                  <p className="text-[11px] font-medium text-pt-muted mt-1">
                    Rs 200 / student
                  </p>
                </div>

                {/* Trainer Card */}
                <div className="portal-tone-sky rounded-2xl border border-pt-subtle p-3.5 shadow-pt">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg portal-tone-icon portal-tone-icon-sky">
                      <GraduationCap size={15} weight="duotone" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                      Trainers
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-pt tabular-nums">
                    {formatMoney(periodStats.trainer, stats.currency)}
                  </p>
                  <p className="text-[11px] font-medium text-pt-muted mt-1">
                    {selectedPhase === "phase-1" ? "Rs 800 / student" : "Rs 700 / student"}
                  </p>
                </div>

                {/* School Card */}
                <div className="portal-tone-emerald rounded-2xl border border-pt-subtle p-3.5 shadow-pt">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg portal-tone-icon portal-tone-icon-emerald">
                      <Buildings size={15} weight="duotone" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      School %
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-pt tabular-nums">
                    {formatMoney(periodStats.school, stats.currency)}
                  </p>
                  <p className="text-[11px] font-medium text-pt-muted mt-1">
                    {selectedPhase === "phase-1" ? "Rs 0 (Phase 1)" : "Rs 100 / student"}
                  </p>
                </div>
              </div>

              {/* Distribution Bar */}
              {periodStats.gross > 0 && (
                <div className="rounded-2xl border border-pt-subtle bg-pt-surface p-4 shadow-pt">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-pt-muted mb-2.5">
                    Revenue Distribution Share
                  </p>
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 gap-0.5 p-0.5 border border-pt-subtle">
                    {periodStats.management > 0 && (
                      <div
                        className="bg-violet-600 rounded-sm transition-all"
                        style={{
                          width: `${(periodStats.management / periodStats.gross) * 100}%`,
                        }}
                        title={`Management: ${Math.round((periodStats.management / periodStats.gross) * 100)}%`}
                      />
                    )}
                    {periodStats.trainer > 0 && (
                      <div
                        className="bg-sky-600 rounded-sm transition-all"
                        style={{
                          width: `${(periodStats.trainer / periodStats.gross) * 100}%`,
                        }}
                        title={`Trainers: ${Math.round((periodStats.trainer / periodStats.gross) * 100)}%`}
                      />
                    )}
                    {periodStats.school > 0 && (
                      <div
                        className="bg-emerald-600 rounded-sm transition-all"
                        style={{
                          width: `${(periodStats.school / periodStats.gross) * 100}%`,
                        }}
                        title={`School: ${Math.round((periodStats.school / periodStats.gross) * 100)}%`}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap justify-between gap-1.5 mt-3 text-xs">
                    <span className="text-violet-700 dark:text-violet-300 font-bold flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-600" />
                      Management {Math.round((periodStats.management / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-600" />
                      Trainers {Math.round((periodStats.trainer / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      School {Math.round((periodStats.school / periodStats.gross) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Course-wise Breakdown */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-pt-muted px-0.5">
                  Course-wise Breakdown
                </p>
                <div className="space-y-3.5">
                  {coursesToDisplay?.map((course) => {
                    const cp = getCoursePeriodStats(course, period);
                    const trainerShort = course.trainerName.split(" ").slice(-1)[0];
                    return (
                      <div
                        key={course.programSlug}
                        className="rounded-2xl border border-pt-subtle overflow-hidden bg-pt-surface shadow-pt transition-all hover:shadow-pt-md"
                      >
                        <div
                          className={cn(
                            "px-4 py-3 bg-gradient-to-r text-white shadow-xs",
                            course.headerGradient
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-sm tracking-tight text-white">{course.courseTitle}</p>
                              <p className="text-xs text-white/90 mt-0.5 font-medium">
                                Trainer: {course.trainerName}
                              </p>
                            </div>
                            <div className="text-right shrink-0 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/20">
                              <p className="text-base sm:text-lg font-extrabold text-white">
                                {period === "all" ? course.uniqueStudents : cp.students}
                              </p>
                              <p className="text-[9px] uppercase tracking-wider text-white/90 font-bold">
                                {period === "all" ? "unique students" : "registrations"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-pt-muted font-semibold">Gross Collected</span>
                            <span className="font-extrabold text-pt text-base sm:text-lg tabular-nums">
                              {formatMoney(cp.gross, stats.currency)}
                            </span>
                          </div>
                          <div className="h-px bg-pt-subtle" />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="portal-tone-violet rounded-xl border border-pt-subtle p-2.5 text-center">
                              <p className="text-[9px] font-bold uppercase text-violet-700 dark:text-violet-300">
                                Management
                              </p>
                              <p className="text-xs sm:text-sm font-extrabold text-pt mt-0.5 tabular-nums">
                                {formatMoney(cp.management, stats.currency)}
                              </p>
                            </div>
                            <div className="portal-tone-sky rounded-xl border border-pt-subtle p-2.5 text-center">
                              <p className="text-[9px] font-bold uppercase text-sky-700 dark:text-sky-300">
                                {trainerShort}
                              </p>
                              <p className="text-xs sm:text-sm font-extrabold text-pt mt-0.5 tabular-nums">
                                {formatMoney(cp.trainer, stats.currency)}
                              </p>
                            </div>
                            <div className="portal-tone-emerald rounded-xl border border-pt-subtle p-2.5 text-center">
                              <p className="text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                                School
                              </p>
                              <p className="text-xs sm:text-sm font-extrabold text-pt mt-0.5 tabular-nums">
                                {formatMoney(cp.school, stats.currency)}
                              </p>
                            </div>
                          </div>

                          {period === "all" && course.approvedCount !== course.uniqueStudents && (
                            <div className="text-xs rounded-xl px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-medium">
                              {course.approvedCount} paid registration
                              {course.approvedCount === 1 ? "" : "s"} (
                              {course.approvedCount - course.uniqueStudents} returning / repeat enrollments)
                            </div>
                          )}
                          {period === "all" && course.thisWeekCount > 0 && (
                            <div className="text-xs rounded-xl px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-medium">
                              +{course.thisWeekCount} new this week (
                              {formatMoney(course.thisWeekGross, stats.currency)} gross)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Phase 1 AI Notice */}
                  {selectedPhase === "phase-1" && (
                    <div className="rounded-2xl border border-dashed border-pt-subtle p-4 text-center bg-pt-surface/40">
                      <p className="text-xs text-pt-muted font-medium flex items-center justify-center gap-1.5">
                        <Sparkle size={15} weight="duotone" className="text-purple-500 shrink-0" />
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
