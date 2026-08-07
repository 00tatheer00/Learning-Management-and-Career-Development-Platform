import { prisma } from "@/lib/prisma";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { excludeDemoEnrollments, isDemoPortalStudent } from "@/lib/constants/demo-student";
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
  activeStudents: Array<{
    programSlug: string | null;
    email: string;
    createdAt?: Date | string | null;
  }>,
  weekStart: Date,
  monthStart: Date
): AdminRevenuePhaseStats {
  const totalApproved = rows.length;
  const thisWeekRows = rows.filter((row) => row.at >= weekStart);
  const thisMonthRows = rows.filter((row) => row.at >= monthStart);

  const totalSplit = calculateTotalRevenue(rows);
  const weekSplit = calculateTotalRevenue(thisWeekRows);
  const monthSplit = calculateTotalRevenue(thisMonthRows);

  const phaseApprovedEmails = new Set(rows.map((r) => r.email.trim().toLowerCase()));

  const phaseActiveStudents = activeStudents.filter((s) =>
    phaseApprovedEmails.has(s.email.trim().toLowerCase())
  );

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

    const uniqueStudents = phaseActiveStudents.filter(
      (student) =>
        student.programSlug === programSlug && !isDemoPortalStudent(student.email)
    ).length;

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
  };
}

export async function getAdminRevenueStats(): Promise<AdminRevenueStats> {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const [approved, activeStudents] = await Promise.all([
    prisma.enrollment.findMany({
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
    }),
    prisma.user.findMany({
      where: { role: "student", isActive: true },
      select: { programSlug: true, email: true, createdAt: true, batch: true, level: true },
    }),
  ]);

  const paidApproved = excludeDemoEnrollments(approved);
  const dated: Array<RevenueSplitItem & { at: Date; email: string }> = paidApproved.map((row) => ({
    program: row.program,
    programSlug: row.program,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt,
    batch: row.batch,
    level: row.level,
    email: row.email,
    at: row.reviewedAt ?? row.createdAt,
  }));

  const phase1Rows = dated.filter((row) => getRegistrationPhase(row.createdAt) === "phase-1");
  const phase2Rows = dated.filter((row) => getRegistrationPhase(row.createdAt) === "phase-2");

  const overall = buildStatsForRows(dated, activeStudents, weekStart, monthStart);
  const phase1 = buildStatsForRows(phase1Rows, activeStudents, weekStart, monthStart);
  const phase2 = buildStatsForRows(phase2Rows, activeStudents, weekStart, monthStart);

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
