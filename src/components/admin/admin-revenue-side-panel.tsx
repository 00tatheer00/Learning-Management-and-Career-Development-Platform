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
  Buildings,
  GraduationCap,
  Sparkle,
} from "@phosphor-icons/react";
import type {
  AdminRevenueStats,
  AdminRevenuePhaseStats,
  AdminRevenueCourseStats,
} from "@/lib/api/admin-revenue";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  selectedPhase: "all" | "phase-1" | "phase-2" | "phase-3"
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
          : selectedPhase === "phase-3"
            ? "Full Phase 3 (August 2026 onwards)"
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
      className="w-full rounded-xl p-2.5 text-left transition-all duration-150 ease-out cursor-pointer select-none group border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-500/50 shadow-xs text-slate-900 dark:text-white"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/40 group-hover:scale-105 transition-transform">
          <CurrencyCircleDollar size={18} weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Revenue
            </p>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
              PKR
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
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
  const [selectedPhase, setSelectedPhase] = useState<"all" | "phase-1" | "phase-2" | "phase-3">("all");

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

  const handlePhaseChange = (phase: "all" | "phase-1" | "phase-2" | "phase-3") => {
    setSelectedPhase(phase);
    // Auto-reset period to 'all' so earlier phase data is not masked
    setPeriod("all");
  };

  if (!open) return null;

  const activeStats: AdminRevenuePhaseStats | null = stats
    ? selectedPhase === "phase-1"
      ? stats.phases?.phase1 ?? stats
      : selectedPhase === "phase-2"
        ? stats.phases?.phase2 ?? stats
        : selectedPhase === "phase-3"
          ? stats.phases?.phase3 ?? stats
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

    if (selectedPhase === "phase-3") {
      const options: Array<{ key: string; label: string }> = [
        { key: "all", label: `All Phase 3 (${stats.phases.phase3?.totalApproved ?? 0})` },
        { key: "month", label: `August (${stats.phases.phase3?.thisMonthApproved ?? 0})` },
      ];
      if (stats.phases.phase3?.monthlyBreakdown) {
        for (const m of stats.phases.phase3.monthlyBreakdown) {
          if (m.monthKey !== "2026-08") {
            options.push({ key: m.monthKey, label: `${m.label.split(" ")[0]} (${m.approvedCount})` });
          }
        }
      }
      options.push({ key: "week", label: `This week (${stats.phases.phase3?.thisWeekApproved ?? 0})` });
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={() => setOpen(false)}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Registration Revenue"
        className="relative flex h-full w-full max-w-[540px] flex-col bg-white text-slate-900 shadow-2xl border-l border-slate-200 z-10"
      >
        {/* Top Header Card */}
        <div className="relative shrink-0 border-b border-slate-200/80 bg-white px-6 pt-5 pb-5">
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                <CurrencyCircleDollar size={26} weight="duotone" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                  Financial Overview
                </p>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Registration Revenue
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={loading}
                className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Refresh data"
              >
                <ArrowClockwise size={18} className={loading ? "animate-spin text-emerald-600" : ""} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
          </div>

          {/* Dynamic phase split explanation in clean, soft pastel cards */}
          {selectedPhase === "phase-1" ? (
            <div className="bg-indigo-50/80 border border-indigo-200/80 text-xs text-slate-700 leading-relaxed rounded-xl p-3.5 shadow-2xs">
              <span className="font-bold text-indigo-700 uppercase text-[10px] tracking-wider bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md mr-2">
                Phase 1 Model
              </span>
              PKR 1,000 → <strong className="text-slate-900">PKR 200</strong> Mgmt (Komal) · <strong className="text-slate-900">PKR 800</strong> Trainer (Tatheer / Talha) · <strong className="text-slate-900">PKR 0</strong> School
            </div>
          ) : selectedPhase === "phase-2" ? (
            <div className="bg-emerald-50/80 border border-emerald-200/80 text-xs text-slate-700 leading-relaxed rounded-xl p-3.5 shadow-2xs">
              <span className="font-bold text-emerald-700 uppercase text-[10px] tracking-wider bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md mr-2">
                Phase 2 Model
              </span>
              PKR 1,000 → <strong className="text-slate-900">PKR 200</strong> Mgmt (Komal) · <strong className="text-slate-900">PKR 700</strong> Trainer · <strong className="text-slate-900">PKR 100</strong> School
            </div>
          ) : selectedPhase === "phase-3" ? (
            <div className="bg-purple-50/80 border border-purple-200/80 text-xs text-slate-700 leading-relaxed rounded-xl p-3.5 shadow-2xs">
              <span className="font-bold text-purple-700 uppercase text-[10px] tracking-wider bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md mr-2">
                Phase 3 Model
              </span>
              PKR 1,000 → <strong className="text-slate-900">PKR 200</strong> Mgmt (Komal) · <strong className="text-slate-900">PKR 700</strong> Trainer · <strong className="text-slate-900">PKR 100</strong> School
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed rounded-xl p-3.5 shadow-2xs">
              <span className="font-bold text-indigo-600">Phase 1:</span> Rs 200 Mgmt / Rs 800 Trainer · <span className="font-bold text-emerald-600">Phase 2:</span> Rs 200 Mgmt / Rs 700 Trainer / Rs 100 School · <span className="font-bold text-purple-600">Phase 3:</span> Rs 200 Mgmt / Rs 700 Trainer / Rs 100 School
            </div>
          )}
        </div>

        {/* Phase Filter Toggle Bar */}
        {stats && stats.phases && (
          <div className="shrink-0 border-b border-slate-200/80 bg-slate-50 px-6 py-2.5 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Module Phase
            </span>
            <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl shadow-xs border border-slate-200">
              <button
                type="button"
                onClick={() => handlePhaseChange("all")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "all"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
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
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
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
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Phase 2 ({stats.phases.phase2.totalApproved})
              </button>
              <button
                type="button"
                onClick={() => handlePhaseChange("phase-3")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  selectedPhase === "phase-3"
                    ? "bg-purple-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Phase 3 ({stats.phases.phase3?.totalApproved ?? 0})
              </button>
            </div>
          </div>
        )}

        {/* Time Period Filter Bar */}
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-6 py-2.5 flex gap-2 overflow-x-auto">
          {periodOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPeriod(opt.key)}
              className={cn(
                "flex-1 min-w-[80px] rounded-xl py-2 px-2.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap text-center border",
                period === opt.key
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-slate-50/60">
          {loading && !stats && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ArrowClockwise size={32} className="animate-spin mb-3 text-emerald-600" />
              <p className="text-sm font-medium">Loading revenue data…</p>
            </div>
          )}

          {stats && periodStats && (
            <>
              {/* Gross Revenue Hero Card — Pure White Card with Soft Slate Accents */}
              <div className="rounded-2xl p-5 border border-slate-200 bg-white shadow-xs transition-all">
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs border shadow-2xs",
                        selectedPhase === "phase-1"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : selectedPhase === "phase-2"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : selectedPhase === "phase-3"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                      )}
                    >
                      {selectedPhase === "phase-1" ? "P1" : selectedPhase === "phase-2" ? "P2" : selectedPhase === "phase-3" ? "P3" : "ALL"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-tight text-slate-900">
                        {periodStats.label}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Gross Revenue Collection</p>
                    </div>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs">
                    {periodStats.students} Paid Registrations
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl border border-slate-200/80 bg-slate-50 text-center mb-3.5">
                  <div>
                    <p className="text-xl font-bold tabular-nums text-slate-900">
                      {periodStats.students}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-600">Approved</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold tabular-nums text-slate-900">0</p>
                    <p className="text-[11px] font-semibold text-amber-600">Pending</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold tabular-nums text-slate-900">
                      {selectedPhase === "phase-1"
                        ? stats.phases.phase1.totalApproved
                        : selectedPhase === "phase-2"
                          ? stats.phases.phase2.totalApproved
                          : selectedPhase === "phase-3"
                            ? (stats.phases.phase3?.totalApproved ?? 0)
                            : periodStats.students}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">Active Students</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-1">
                  <span>Gross Collected</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">
                    {formatMoney(periodStats.gross, stats.currency)}
                  </span>
                </div>
              </div>

              {/* 3 Share Cards (Management, Trainers, School) — Soft Pastel Clean Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Management Card */}
                <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 border border-violet-200/60">
                      <Buildings size={15} weight="duotone" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                      Komal (Mgmt)
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                    {formatMoney(periodStats.management, stats.currency)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">
                    Rs 200 / student
                  </p>
                </div>

                {/* Trainer Card */}
                <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 border border-sky-200/60">
                      <GraduationCap size={15} weight="duotone" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                      Trainers
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                    {formatMoney(periodStats.trainer, stats.currency)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">
                    {selectedPhase === "phase-1" ? "Rs 800 / student" : "Rs 700 / student"}
                  </p>
                </div>

                {/* School Card */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                      <Buildings size={15} weight="duotone" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      School %
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                    {formatMoney(periodStats.school, stats.currency)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">
                    {selectedPhase === "phase-1" ? "Rs 0 (Phase 1)" : "Rs 100 / student"}
                  </p>
                </div>
              </div>

              {/* Distribution Bar */}
              {periodStats.gross > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Revenue Distribution Share
                  </p>
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 gap-0.5 p-0.5 border border-slate-200">
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
                    <span className="text-violet-700 font-bold flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-600" />
                      Management {Math.round((periodStats.management / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-sky-700 font-bold flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-600" />
                      Trainers {Math.round((periodStats.trainer / periodStats.gross) * 100)}%
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      School {Math.round((periodStats.school / periodStats.gross) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Course-wise Breakdown */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 px-0.5">
                  Course-wise Breakdown
                </p>
                <div className="space-y-3.5">
                  {coursesToDisplay?.map((course) => {
                    const cp = getCoursePeriodStats(course, period);
                    const trainerShort = course.trainerName.split(" ").slice(-1)[0];
                    return (
                      <div
                        key={course.programSlug}
                        className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs transition-all hover:shadow-xs"
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
                              <p className="text-base sm:text-lg font-black text-white">
                                {period === "all" ? course.uniqueStudents : cp.students}
                              </p>
                              <p className="text-[9px] uppercase tracking-wider text-white/90 font-bold">
                                {period === "all" ? "unique students" : "registrations"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 space-y-3.5 bg-white">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500 font-semibold">Gross Collected</span>
                            <span className="font-black text-slate-900 text-base sm:text-lg tabular-nums">
                              {formatMoney(cp.gross, stats.currency)}
                            </span>
                          </div>
                          <div className="h-px bg-slate-100" />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-xl border border-violet-200/70 bg-violet-50/70 p-2.5 text-center">
                              <p className="text-[9px] font-bold uppercase text-violet-700">
                                Management
                              </p>
                              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 tabular-nums">
                                {formatMoney(cp.management, stats.currency)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-sky-200/70 bg-sky-50/70 p-2.5 text-center">
                              <p className="text-[9px] font-bold uppercase text-sky-700">
                                {trainerShort}
                              </p>
                              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 tabular-nums">
                                {formatMoney(cp.trainer, stats.currency)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-2.5 text-center">
                              <p className="text-[9px] font-bold uppercase text-emerald-700">
                                School
                              </p>
                              <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 tabular-nums">
                                {formatMoney(cp.school, stats.currency)}
                              </p>
                            </div>
                          </div>

                          {period === "all" && course.approvedCount !== course.uniqueStudents && (
                            <div className="text-xs rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                              {course.approvedCount} paid registration
                              {course.approvedCount === 1 ? "" : "s"} (
                              {course.approvedCount - course.uniqueStudents} returning / repeat enrollments)
                            </div>
                          )}
                          {period === "all" && course.thisWeekCount > 0 && (
                            <div className="text-xs rounded-xl px-3 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
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
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center bg-slate-50">
                      <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
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
