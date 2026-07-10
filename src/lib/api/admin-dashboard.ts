import { prisma } from "@/lib/prisma";
import { getAdminProgramStats } from "@/lib/api/admin-program-stats";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { excludeDemoEnrollments } from "@/lib/constants/demo-student";
import { revenueFromStudents } from "@/lib/constants/revenue-split";

export interface AdminDashboardData {
  pendingEnrollments: number;
  approvedEnrollments: number;
  totalEnrollments: number;
  students: number;
  trainerAssignedStudents: number;
  missingTrainerAssignments: number;
  returningRegistrations: number;
  assignments: number;
  upcomingSessions: number;
  trainers: number;
  estimatedRevenue: number;
  loggedInStudents: number;
  neverLoggedInStudents: number;
  firstTimeRegistrations: number;
  webStudents: number;
  appStudents: number;
  trends: {
    approved: string;
    pending: string;
    students: string;
    revenue: string;
  };
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%";
  }
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${Math.round(delta)}%`;
}

function trendLabel(change: string, period = "vs last month") {
  return `${change} ${period}`;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    programStats,
    assignments,
    sessions,
    trainers,
    studentsWithLogin,
    approvedThisMonth,
    approvedPrevMonth,
    pendingThisMonth,
    pendingPrevMonth,
    studentsThisMonth,
    studentsPrevMonth,
  ] = await Promise.all([
    getAdminProgramStats(),
    prisma.assignment.count(),
    prisma.liveSession.findMany({ select: { date: true } }),
    prisma.user.count({ where: { role: "trainer", isActive: true } }),
    prisma.user.findMany({
      where: { role: "student", isActive: true },
      select: { firstLoginAt: true, programSlug: true },
    }),
    prisma.enrollment.count({
      where: { status: "approved", reviewedAt: { gte: monthStart } },
    }),
    prisma.enrollment.count({
      where: {
        status: "approved",
        reviewedAt: { gte: prevMonthStart, lt: monthStart },
      },
    }),
    prisma.enrollment.count({
      where: { status: "pending", createdAt: { gte: monthStart } },
    }),
    prisma.enrollment.count({
      where: {
        status: "pending",
        createdAt: { gte: prevMonthStart, lt: monthStart },
      },
    }),
    prisma.user.count({
      where: { role: "student", isActive: true, createdAt: { gte: monthStart } },
    }),
    prisma.user.count({
      where: {
        role: "student",
        isActive: true,
        createdAt: { gte: prevMonthStart, lt: monthStart },
      },
    }),
  ]);

  const today = now.toISOString().split("T")[0];
  const upcomingSessions = sessions.filter((s) => s.date >= today).length;

  const loggedInStudents = studentsWithLogin.filter((s) => s.firstLoginAt).length;
  const neverLoggedInStudents = studentsWithLogin.length - loggedInStudents;

  const webSlug = ENROLLABLE_PROGRAM_SLUGS[0];
  const appSlug = ENROLLABLE_PROGRAM_SLUGS[1];
  const webStudents = studentsWithLogin.filter((s) => s.programSlug === webSlug).length;
  const appStudents = studentsWithLogin.filter((s) => s.programSlug === appSlug).length;

  const firstTimeRegistrations =
    programStats.approvedRegistrations - programStats.returningRegistrations;

  const approvedForRevenue = await prisma.enrollment.findMany({
    where: { status: "approved" },
    select: { id: true, email: true },
  });
  const revenue = revenueFromStudents(excludeDemoEnrollments(approvedForRevenue).length);

  return {
    pendingEnrollments: programStats.pendingEnrollments,
    approvedEnrollments: programStats.approvedRegistrations,
    totalEnrollments: programStats.totalEnrollments,
    students: programStats.activeStudents,
    trainerAssignedStudents: programStats.trainerAssignedStudents,
    missingTrainerAssignments: programStats.missingTrainerAssignments,
    returningRegistrations: programStats.returningRegistrations,
    assignments,
    upcomingSessions,
    trainers,
    estimatedRevenue: revenue.gross,
    loggedInStudents,
    neverLoggedInStudents,
    firstTimeRegistrations,
    webStudents,
    appStudents,
    trends: {
      approved: trendLabel(percentChange(approvedThisMonth, approvedPrevMonth)),
      pending: trendLabel(percentChange(pendingThisMonth, pendingPrevMonth)),
      students: trendLabel(percentChange(studentsThisMonth, studentsPrevMonth)),
      revenue: trendLabel(percentChange(approvedThisMonth, approvedPrevMonth)),
    },
  };
}
