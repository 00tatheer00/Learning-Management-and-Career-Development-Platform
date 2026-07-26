"use client";

import { BarChart3, TrendingUp, DollarSign, UserCheck, Clock } from "lucide-react";

export interface AnalyticsData {
  totalRevenue: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalCount: number;
  programBreakdown: {
    slug: string;
    title: string;
    count: number;
    approved: number;
  }[];
}

export function AdminAnalyticsCharts({ data }: { data: AnalyticsData }) {
  const approvalRate = data.totalCount > 0
    ? Math.round((data.approvedCount / data.totalCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted">Total Verified Revenue</p>
            <h4 className="text-2xl font-black text-foreground mt-1">
              PKR {data.totalRevenue.toLocaleString()}
            </h4>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> Approved Payments
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted">Approval Rate</p>
            <h4 className="text-2xl font-black text-foreground mt-1">{approvalRate}%</h4>
            <p className="text-[11px] text-muted font-semibold mt-1">
              {data.approvedCount} of {data.totalCount} Registrations
            </p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted">Pending Verification</p>
            <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {data.pendingCount}
            </h4>
            <p className="text-[11px] text-muted font-semibold mt-1 flex items-center gap-1">
              <Clock size={12} /> Awaiting Screenshot Review
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Program Breakdown Visual Bar Progress */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Registration Breakdown by Program
          </h4>
          <span className="text-xs font-semibold text-muted">Total: {data.totalCount}</span>
        </div>

        <div className="space-y-3">
          {data.programBreakdown.map((prog) => {
            const percentage = data.totalCount > 0
              ? Math.round((prog.count / data.totalCount) * 100)
              : 0;

            return (
              <div key={prog.slug} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{prog.title}</span>
                  <span className="font-semibold text-muted">
                    {prog.count} applicants ({prog.approved} approved · {percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
