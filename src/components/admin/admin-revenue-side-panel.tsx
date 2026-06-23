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

function getPeriodStats(stats: AdminRevenueStats, period: RevenuePeriod) {
  if (period === "week") {
    return {
      students: stats.thisWeekApproved,
      gross: stats.thisWeekGross,
      management: stats.thisWeekManagement,
      trainer: stats.thisWeekTrainer,
      label: "This week",
    };
  }
  if (period === "month") {
    return {
      students: stats.thisMonthApproved,
      gross: stats.thisMonthGross,
      management: stats.thisMonthManagement,
      trainer: stats.thisMonthTrainer,
      label: "This month",
    };
  }
  return {
    students: stats.totalApproved,
    gross: stats.totalGross,
    management: stats.totalManagement,
    trainer: stats.totalTrainer,
    label: "All time",
  };
}

function getCoursePeriodStats(
  course: AdminRevenueStats["byCourse"][number],
  period: RevenuePeriod,
  managementShare: number,
  trainerShare: number
) {
  if (period === "week") {
    return {
      students: course.thisWeekCount,
      gross: course.thisWeekGross,
      management: course.thisWeekManagement,
      trainer: course.thisWeekTrainer,
    };
  }
  if (period === "month") {
    const m = course.thisMonthCount;
    return {
      students: m,
      gross: course.thisMonthGross,
      management: m * managementShare,
      trainer: m * trainerShare,
    };
  }
  return {
    students: course.approvedCount,
    gross: course.gross,
    management: course.managementShare,
    trainer: course.trainerShare,
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

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
      className="gap-2 border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900"
    >
      <CurrencyCircleDollar size={18} weight="duotone" />
      <span className="hidden sm:inline">Revenue</span>
    </Button>
  );
}

export function AdminRevenueSidebarCard() {
  const ctx = useAdminRevenueOptional();
  if (!ctx) return null;

  const weekHint =
    ctx.stats && ctx.stats.thisWeekApproved > 0
      ? `+${formatMoney(ctx.stats.thisWeekGross, ctx.stats.currency)} this week`
      : "Tap for full breakdown";

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(true)}
      className="w-full rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-3.5 text-left transition-all hover:border-emerald-300 hover:shadow-md group"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <CurrencyCircleDollar size={18} weight="duotone" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Registration Revenue
          </p>
          <p className="text-sm font-semibold text-emerald-950 truncate">
            {ctx.stats
              ? formatMoney(ctx.stats.totalGross, ctx.stats.currency)
              : "Open panel"}
          </p>
          <p className="text-[11px] text-emerald-700/80 truncate">{weekHint}</p>
        </div>
        <CaretRight
          size={14}
          weight="bold"
          className="shrink-0 text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  );
}

function AdminRevenueSidePanel() {
  const { open, setOpen, stats, loading, refresh } = useAdminRevenue();
  const [period, setPeriod] = useState<RevenuePeriod>("all");

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

  const periodStats = stats ? getPeriodStats(stats, period) : null;

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
        className="relative flex h-full w-full max-w-[440px] flex-col bg-background shadow-2xl"
      >
        <div className="relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
          <div className="relative px-5 pt-5 pb-6 text-white">
            <div className="flex items-start justify-between gap-3 mb-5">
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
              <p className="text-sm text-emerald-100/90">
                Rs {stats.registrationFee.toLocaleString()} per student — Rs{" "}
                {stats.managementShare} management · Rs {stats.trainerShare} trainer
              </p>
            )}
          </div>
        </div>

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
                "flex-1 rounded-xl py-2 text-xs font-semibold transition-all",
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
              <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-5 shadow-sm">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50 to-white p-4">
                  <div className="flex items-center gap-2 text-violet-700 mb-2">
                    <Buildings size={16} weight="duotone" />
                    <p className="text-[11px] font-bold uppercase tracking-wider">Management</p>
                  </div>
                  <p className="text-xl font-bold text-violet-950">
                    {formatMoney(periodStats.management, stats.currency)}
                  </p>
                  <p className="text-xs text-violet-700/70 mt-1">
                    Rs {stats.managementShare} × {periodStats.students}
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-white p-4">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <GraduationCap size={16} weight="duotone" />
                    <p className="text-[11px] font-bold uppercase tracking-wider">Trainers</p>
                  </div>
                  <p className="text-xl font-bold text-blue-950">
                    {formatMoney(periodStats.trainer, stats.currency)}
                  </p>
                  <p className="text-xs text-blue-700/70 mt-1">
                    Rs {stats.trainerShare} × {periodStats.students}
                  </p>
                </div>
              </div>

              {periodStats.gross > 0 && (
                <div className="rounded-xl border border-border bg-secondary/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                    Per Rs 1,000 split
                  </p>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-violet-500"
                      style={{
                        width: `${(stats.managementShare / stats.registrationFee) * 100}%`,
                      }}
                    />
                    <div className="bg-blue-500 flex-1" />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px] text-muted">
                    <span className="text-violet-700 font-medium">
                      Management{" "}
                      {Math.round((stats.managementShare / stats.registrationFee) * 100)}%
                    </span>
                    <span className="text-blue-700 font-medium">
                      Trainer {Math.round((stats.trainerShare / stats.registrationFee) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3 px-0.5">
                  Course-wise breakdown
                </p>
                <div className="space-y-3">
                  {stats.byCourse.map((course) => {
                    const cp = getCoursePeriodStats(
                      course,
                      period,
                      stats.managementShare,
                      stats.trainerShare
                    );
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
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-violet-50 border border-violet-100 px-3 py-2.5">
                              <p className="text-[10px] font-bold uppercase text-violet-600">
                                Management
                              </p>
                              <p className="text-sm font-bold text-violet-900 mt-0.5">
                                {formatMoney(cp.management, stats.currency)}
                              </p>
                              <p className="text-[10px] text-violet-600/70">
                                Rs {stats.managementShare} × {cp.students}
                              </p>
                            </div>
                            <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
                              <p className="text-[10px] font-bold uppercase text-blue-600">
                                {trainerShort}&apos;s share
                              </p>
                              <p className="text-sm font-bold text-blue-900 mt-0.5">
                                {formatMoney(cp.trainer, stats.currency)}
                              </p>
                              <p className="text-[10px] text-blue-600/70">
                                Rs {stats.trainerShare} × {cp.students}
                              </p>
                            </div>
                          </div>
                          {period === "all" && course.approvedCount !== course.uniqueStudents && (
                            <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                              {course.approvedCount} paid registration
                              {course.approvedCount === 1 ? "" : "s"} (
                              {course.approvedCount - course.uniqueStudents} returning)
                            </p>
                          )}
                          {period === "all" && course.thisWeekCount > 0 && (
                            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
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
