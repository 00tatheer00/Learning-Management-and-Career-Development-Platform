import { prisma } from "@/lib/prisma";
import { PAYMENT_CONFIG, ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramBySlug } from "@/lib/data/programs";

export interface AdminRevenueStats {
  registrationFee: number;
  currency: string;
  totalApproved: number;
  totalRevenue: number;
  thisWeekApproved: number;
  thisWeekRevenue: number;
  thisMonthApproved: number;
  thisMonthRevenue: number;
  byCourse: Array<{
    programSlug: string;
    courseTitle: string;
    approvedCount: number;
    revenue: number;
    thisWeekCount: number;
    thisWeekRevenue: number;
  }>;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getAdminRevenueStats(): Promise<AdminRevenueStats> {
  const fee = PAYMENT_CONFIG.registrationFee;
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const approved = await prisma.enrollment.findMany({
    where: { status: "approved" },
    select: { program: true, createdAt: true, reviewedAt: true },
  });

  const dated = approved.map((row) => ({
    program: row.program,
    at: row.reviewedAt ?? row.createdAt,
  }));

  const totalApproved = dated.length;
  const thisWeekApproved = dated.filter((row) => row.at >= weekStart).length;
  const thisMonthApproved = dated.filter((row) => row.at >= monthStart).length;

  const byCourse = ENROLLABLE_PROGRAM_SLUGS.map((programSlug) => {
    const rows = dated.filter((row) => row.program === programSlug);
    const weekRows = rows.filter((row) => row.at >= weekStart);
    return {
      programSlug,
      courseTitle: getProgramBySlug(programSlug)?.title ?? programSlug,
      approvedCount: rows.length,
      revenue: rows.length * fee,
      thisWeekCount: weekRows.length,
      thisWeekRevenue: weekRows.length * fee,
    };
  });

  return {
    registrationFee: fee,
    currency: PAYMENT_CONFIG.currency,
    totalApproved,
    totalRevenue: totalApproved * fee,
    thisWeekApproved,
    thisWeekRevenue: thisWeekApproved * fee,
    thisMonthApproved,
    thisMonthRevenue: thisMonthApproved * fee,
    byCourse,
  };
}
