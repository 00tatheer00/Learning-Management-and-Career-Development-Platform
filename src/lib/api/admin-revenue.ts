import { prisma } from "@/lib/prisma";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { REVENUE_SPLIT, revenueFromStudents } from "@/lib/constants/revenue-split";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { getProgramBySlug } from "@/lib/data/programs";
import { trainers } from "@/lib/data/trainers";

export interface AdminRevenueCourseStats {
  programSlug: string;
  courseTitle: string;
  shortLabel: string;
  trainerName: string;
  headerGradient: string;
  approvedCount: number;
  uniqueStudents: number;
  gross: number;
  managementShare: number;
  trainerShare: number;
  thisWeekCount: number;
  thisWeekGross: number;
  thisWeekManagement: number;
  thisWeekTrainer: number;
  thisMonthCount: number;
  thisMonthGross: number;
}

export interface AdminRevenueStats {
  registrationFee: number;
  managementShare: number;
  trainerShare: number;
  currency: string;
  totalApproved: number;
  totalGross: number;
  totalManagement: number;
  totalTrainer: number;
  thisWeekApproved: number;
  thisWeekGross: number;
  thisWeekManagement: number;
  thisWeekTrainer: number;
  thisMonthApproved: number;
  thisMonthGross: number;
  thisMonthManagement: number;
  thisMonthTrainer: number;
  byCourse: AdminRevenueCourseStats[];
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

function splitForCount(count: number) {
  return revenueFromStudents(count);
}

export async function getAdminRevenueStats(): Promise<AdminRevenueStats> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const [approved, activeStudents] = await Promise.all([
    prisma.enrollment.findMany({
      where: { status: "approved" },
      select: { program: true, createdAt: true, reviewedAt: true },
    }),
    prisma.user.findMany({
      where: { role: "student", isActive: true },
      select: { programSlug: true },
    }),
  ]);

  const dated = approved.map((row) => ({
    program: row.program,
    at: row.reviewedAt ?? row.createdAt,
  }));

  const totalApproved = dated.length;
  const thisWeekRows = dated.filter((row) => row.at >= weekStart);
  const thisMonthRows = dated.filter((row) => row.at >= monthStart);

  const totalSplit = splitForCount(totalApproved);
  const weekSplit = splitForCount(thisWeekRows.length);
  const monthSplit = splitForCount(thisMonthRows.length);

  const byCourse = ENROLLABLE_PROGRAM_SLUGS.map((programSlug) => {
    const category = getProgramCategory(programSlug);
    const rows = dated.filter((row) => row.program === programSlug);
    const weekRows = rows.filter((row) => row.at >= weekStart);
    const monthRows = rows.filter((row) => row.at >= monthStart);
    const all = splitForCount(rows.length);
    const week = splitForCount(weekRows.length);
    const trainer = trainers.find((t) => t.id === category?.primaryTrainerSeedId);

    const uniqueStudents = activeStudents.filter(
      (student) => student.programSlug === programSlug
    ).length;

    return {
      programSlug,
      courseTitle: getProgramBySlug(programSlug)?.title ?? programSlug,
      shortLabel: category?.shortLabel ?? programSlug,
      trainerName: trainer?.name ?? "Trainer",
      headerGradient: category?.headerGradient ?? "from-slate-600 to-slate-800",
      approvedCount: rows.length,
      uniqueStudents,
      gross: all.gross,
      managementShare: all.management,
      trainerShare: all.trainer,
      thisWeekCount: weekRows.length,
      thisWeekGross: week.gross,
      thisWeekManagement: week.management,
      thisWeekTrainer: week.trainer,
      thisMonthCount: monthRows.length,
      thisMonthGross: splitForCount(monthRows.length).gross,
    };
  });

  return {
    registrationFee: REVENUE_SPLIT.registrationFee,
    managementShare: REVENUE_SPLIT.managementShare,
    trainerShare: REVENUE_SPLIT.trainerShare,
    currency: REVENUE_SPLIT.currency,
    totalApproved,
    totalGross: totalSplit.gross,
    totalManagement: totalSplit.management,
    totalTrainer: totalSplit.trainer,
    thisWeekApproved: thisWeekRows.length,
    thisWeekGross: weekSplit.gross,
    thisWeekManagement: weekSplit.management,
    thisWeekTrainer: weekSplit.trainer,
    thisMonthApproved: thisMonthRows.length,
    thisMonthGross: monthSplit.gross,
    thisMonthManagement: monthSplit.management,
    thisMonthTrainer: monthSplit.trainer,
    byCourse,
  };
}
