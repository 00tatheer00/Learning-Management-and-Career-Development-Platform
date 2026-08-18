import { prisma } from "@/lib/prisma";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { excludeDemoEnrollments } from "@/lib/constants/demo-student";
import {
  REVENUE_SPLIT,
  calculateTotalRevenue,
  type RevenueSplitItem,
} from "@/lib/constants/revenue-split";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { getProgramBySlug } from "@/lib/data/programs";
import { trainers } from "@/lib/data/trainers";
import { getRegistrationPhase } from "@/lib/services/phase-service";

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
  schoolShare: number;
  thisWeekCount: number;
  thisWeekGross: number;
  thisWeekManagement: number;
  thisWeekTrainer: number;
  thisWeekSchool: number;
  thisMonthCount: number;
  thisMonthGross: number;
  thisMonthManagement: number;
  thisMonthTrainer: number;
  thisMonthSchool: number;
  monthlyBreakdown?: AdminRevenueMonthBreakdown[];
}

export interface AdminRevenueMonthBreakdown {
  monthKey: string;
  label: string;
  approvedCount: number;
  gross: number;
  management: number;
  trainer: number;
  school: number;
}

export interface AdminRevenuePhaseStats {
  totalApproved: number;
  totalGross: number;
  totalManagement: number;
  totalTrainer: number;
  totalSchool: number;
  thisWeekApproved: number;
  thisWeekGross: number;
  thisWeekManagement: number;
  thisWeekTrainer: number;
  thisWeekSchool: number;
  thisMonthApproved: number;
  thisMonthGross: number;
  thisMonthManagement: number;
  thisMonthTrainer: number;
  thisMonthSchool: number;
  byCourse: AdminRevenueCourseStats[];
  monthlyBreakdown: AdminRevenueMonthBreakdown[];
}

export interface AdminRevenueStats extends AdminRevenuePhaseStats {
  registrationFee: number;
  managementShare: number;
  trainerShare: number;
  schoolShare: number;
  currency: string;
  phases: {
    phase1: AdminRevenuePhaseStats;
    phase2: AdminRevenuePhaseStats;
  };
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

function buildStatsForRows(
  rows: Array<RevenueSplitItem & { at: Date; email: string }>,
  weekStart: Date,
  monthStart: Date
): AdminRevenuePhaseStats {
  const totalApproved = rows.length;
  const thisWeekRows = rows.filter((row) => row.at >= weekStart);
  const thisMonthRows = rows.filter((row) => row.at >= monthStart);

  const totalSplit = calculateTotalRevenue(rows);
  const weekSplit = calculateTotalRevenue(thisWeekRows);
  const monthSplit = calculateTotalRevenue(thisMonthRows);

  const byCourse = ENROLLABLE_PROGRAM_SLUGS.map((programSlug) => {
    const category = getProgramCategory(programSlug);
    const courseRows = rows.filter(
      (row) => row.program === programSlug || row.programSlug === programSlug
    );
    const courseWeekRows = courseRows.filter((row) => row.at >= weekStart);
    const courseMonthRows = courseRows.filter((row) => row.at >= monthStart);

    const all = calculateTotalRevenue(courseRows);
    const week = calculateTotalRevenue(courseWeekRows);
    const month = calculateTotalRevenue(courseMonthRows);
    const trainer = trainers.find((t) => t.id === category?.primaryTrainerSeedId);

    // Count distinct student emails specifically for this course in this subset
    const uniqueStudents = new Set(
      courseRows.map((r) => r.email.trim().toLowerCase())
    ).size;

    const courseMonthMap = new Map<string, Array<RevenueSplitItem & { at: Date; email: string }>>();
    for (const row of courseRows) {
      const d = new Date(row.at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!courseMonthMap.has(key)) {
        courseMonthMap.set(key, []);
      }
      courseMonthMap.get(key)!.push(row);
    }
    const courseMonthlyBreakdown: AdminRevenueMonthBreakdown[] = Array.from(courseMonthMap.keys())
      .sort()
      .map((key) => {
        const monthRows = courseMonthMap.get(key)!;
        const [yearStr, monthStr] = key.split("-");
        const monthIdx = parseInt(monthStr, 10) - 1;
        const label = `${MONTH_NAMES[monthIdx] ?? monthStr} ${yearStr}`;
        const split = calculateTotalRevenue(monthRows);
        return {
          monthKey: key,
          label,
          approvedCount: monthRows.length,
          gross: split.gross,
          management: split.management,
          trainer: split.trainer,
          school: split.school,
        };
      });

    return {
      programSlug,
      courseTitle: getProgramBySlug(programSlug)?.title ?? programSlug,
      shortLabel: category?.shortLabel ?? programSlug,
      trainerName: trainer?.name ?? "Trainer",
      headerGradient: category?.headerGradient ?? "from-slate-600 to-slate-800",
      approvedCount: courseRows.length,
      uniqueStudents,
      gross: all.gross,
      managementShare: all.management,
      trainerShare: all.trainer,
      schoolShare: all.school,
      thisWeekCount: courseWeekRows.length,
      thisWeekGross: week.gross,
      thisWeekManagement: week.management,
      thisWeekTrainer: week.trainer,
      thisWeekSchool: week.school,
      thisMonthCount: courseMonthRows.length,
      thisMonthGross: month.gross,
      thisMonthManagement: month.management,
      thisMonthTrainer: month.trainer,
      thisMonthSchool: month.school,
      monthlyBreakdown: courseMonthlyBreakdown,
    };
  });

  // Calculate monthly breakdown
  const monthMap = new Map<string, Array<RevenueSplitItem & { at: Date; email: string }>>();
  for (const row of rows) {
    const d = new Date(row.at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap.has(key)) {
      monthMap.set(key, []);
    }
    monthMap.get(key)!.push(row);
  }

  const sortedMonthKeys = Array.from(monthMap.keys()).sort();
  const monthlyBreakdown: AdminRevenueMonthBreakdown[] = sortedMonthKeys.map((key) => {
    const monthRows = monthMap.get(key)!;
    const [yearStr, monthStr] = key.split("-");
    const monthIdx = parseInt(monthStr, 10) - 1;
    const label = `${MONTH_NAMES[monthIdx] ?? monthStr} ${yearStr}`;
    const split = calculateTotalRevenue(monthRows);
    return {
      monthKey: key,
      label,
      approvedCount: monthRows.length,
      gross: split.gross,
      management: split.management,
      trainer: split.trainer,
      school: split.school,
    };
  });

  return {
    totalApproved,
    totalGross: totalSplit.gross,
    totalManagement: totalSplit.management,
    totalTrainer: totalSplit.trainer,
    totalSchool: totalSplit.school,
    thisWeekApproved: thisWeekRows.length,
    thisWeekGross: weekSplit.gross,
    thisWeekManagement: weekSplit.management,
    thisWeekTrainer: weekSplit.trainer,
    thisWeekSchool: weekSplit.school,
    thisMonthApproved: thisMonthRows.length,
    thisMonthGross: monthSplit.gross,
    thisMonthManagement: monthSplit.management,
    thisMonthTrainer: monthSplit.trainer,
    thisMonthSchool: monthSplit.school,
    byCourse,
    monthlyBreakdown,
  };
}

export async function getAdminRevenueStats(): Promise<AdminRevenueStats> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const approved = await prisma.enrollment.findMany({
    where: { status: "approved" },
    select: {
      id: true,
      program: true,
      createdAt: true,
      reviewedAt: true,
      email: true,
      batch: true,
      level: true,
    },
  });

  const paidApproved = excludeDemoEnrollments(approved);
  const dated: Array<RevenueSplitItem & { at: Date; email: string }> = paidApproved.map((row) => ({
    program: row.program,
    programSlug: row.program,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt,
    batch: row.batch,
    level: row.level,
    email: row.email,
    at: row.createdAt,
  }));

  const phase1Rows = dated.filter((row) => getRegistrationPhase(row.createdAt) === "phase-1");
  const phase2Rows = dated.filter((row) => getRegistrationPhase(row.createdAt) === "phase-2");

  const overall = buildStatsForRows(dated, weekStart, monthStart);
  const phase1 = buildStatsForRows(phase1Rows, weekStart, monthStart);
  const phase2 = buildStatsForRows(phase2Rows, weekStart, monthStart);

  return {
    registrationFee: REVENUE_SPLIT.registrationFee,
    managementShare: REVENUE_SPLIT.managementShare,
    trainerShare: REVENUE_SPLIT.trainerShare,
    schoolShare: REVENUE_SPLIT.schoolShare,
    currency: REVENUE_SPLIT.currency,
    ...overall,
    phases: {
      phase1,
      phase2,
    },
  };
}
