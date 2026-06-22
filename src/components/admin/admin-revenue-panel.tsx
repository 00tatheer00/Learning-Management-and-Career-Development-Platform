import { CurrencyCircleDollar, TrendUp } from "@phosphor-icons/react/ssr";
import { getAdminRevenueStats } from "@/lib/api/admin-revenue";

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-PK")}`;
}

export async function AdminRevenuePanel() {
  const stats = await getAdminRevenueStats();

  return (
    <aside className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm h-fit lg:sticky lg:top-24">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <CurrencyCircleDollar size={24} weight="duotone" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Registration Revenue
          </p>
          <p className="text-sm text-emerald-900/80">
            Rs {stats.registrationFee.toLocaleString()} per approved form
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="rounded-xl border border-emerald-200 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total collected</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">
            {formatMoney(stats.totalRevenue, stats.currency)}
          </p>
          <p className="text-sm text-muted mt-1">
            {stats.totalApproved} paid registration{stats.totalApproved === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-white/70 p-4">
          <div className="flex items-center gap-2 text-emerald-800 mb-1">
            <TrendUp size={16} weight="duotone" />
            <p className="text-xs font-semibold uppercase tracking-wide">This week</p>
          </div>
          <p className="text-xl font-bold text-emerald-900">
            {formatMoney(stats.thisWeekRevenue, stats.currency)}
          </p>
          <p className="text-sm text-muted">
            {stats.thisWeekApproved} new approval{stats.thisWeekApproved === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">This month</p>
          <p className="mt-1 text-lg font-bold">
            {formatMoney(stats.thisMonthRevenue, stats.currency)}
          </p>
          <p className="text-sm text-muted">{stats.thisMonthApproved} approvals</p>
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">By course</p>
      <div className="space-y-2">
        {stats.byCourse.map((course) => (
          <div
            key={course.programSlug}
            className="rounded-xl border border-border bg-background px-3 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{course.courseTitle}</p>
                <p className="text-xs text-muted mt-0.5">
                  {course.approvedCount} student{course.approvedCount === 1 ? "" : "s"}
                </p>
              </div>
              <p className="text-sm font-bold text-emerald-800 whitespace-nowrap">
                {formatMoney(course.revenue, stats.currency)}
              </p>
            </div>
            {course.thisWeekCount > 0 && (
              <p className="text-xs text-emerald-700 mt-2">
                +{course.thisWeekCount} this week ({formatMoney(course.thisWeekRevenue, stats.currency)})
              </p>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
