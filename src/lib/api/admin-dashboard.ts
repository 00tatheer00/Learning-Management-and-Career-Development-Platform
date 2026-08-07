import { prisma } from "@/lib/prisma";
import { getAdminProgramStats } from "@/lib/api/admin-program-stats";
import { getCentralPhaseMetrics, type CentralPhaseMetrics } from "@/lib/services/phase-service";

export type PhaseMetrics = CentralPhaseMetrics;

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
  phaseBreakdown: {
    phase1: PhaseMetrics;
    phase2: PhaseMetrics;
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
    allMetrics,
    phase1Metrics,
    phase2Metrics,
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
    getCentralPhaseMetrics("all"),
    getCentralPhaseMetrics("phase-1"),
    getCentralPhaseMetrics("phase-2"),
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

  return {
    pendingEnrollments: allMetrics.pendingEnrollments,
    approvedEnrollments: allMetrics.approvedEnrollments,
    totalEnrollments: allMetrics.totalEnrollments,
    students: allMetrics.students,
    trainerAssignedStudents: programStats.trainerAssignedStudents,
    missingTrainerAssignments: programStats.missingTrainerAssignments,
    returningRegistrations: allMetrics.returningRegistrations,
    assignments,
    upcomingSessions,
    trainers,
    estimatedRevenue: allMetrics.estimatedRevenue,
    loggedInStudents: allMetrics.loggedInStudents,
    neverLoggedInStudents: allMetrics.neverLoggedInStudents,
    firstTimeRegistrations: allMetrics.firstTimeRegistrations,
    webStudents: allMetrics.webStudents,
    appStudents: allMetrics.appStudents,
    trends: {
      approved: trendLabel(percentChange(approvedThisMonth, approvedPrevMonth)),
      pending: trendLabel(percentChange(pendingThisMonth, pendingPrevMonth)),
      students: trendLabel(percentChange(studentsThisMonth, studentsPrevMonth)),
      revenue: trendLabel(percentChange(approvedThisMonth, approvedPrevMonth)),
    },
    phaseBreakdown: {
      phase1: phase1Metrics,
      phase2: phase2Metrics,
    },
  };
}
