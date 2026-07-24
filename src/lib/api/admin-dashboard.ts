import { prisma } from "@/lib/prisma";
import { getAdminProgramStats } from "@/lib/api/admin-program-stats";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { excludeDemoEnrollments } from "@/lib/constants/demo-student";
import { revenueFromStudents } from "@/lib/constants/revenue-split";
import { getRegistrationPhase } from "@/lib/constants/batch";

export interface PhaseMetrics {
  totalEnrollments: number;
  approvedEnrollments: number;
  pendingEnrollments: number;
  students: number;
  firstTimeRegistrations: number;
  returningRegistrations: number;
  estimatedRevenue: number;
  loggedInStudents: number;
  webStudents: number;
  appStudents: number;
}

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
    allEnrollments,
    allStudents,
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
    prisma.enrollment.findMany({
      select: { id: true, status: true, program: true, email: true, createdAt: true, batch: true },
    }),
    prisma.user.findMany({
      where: { role: "student", isActive: true },
      select: { id: true, firstLoginAt: true, programSlug: true, createdAt: true, batch: true, level: true },
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

  const loggedInStudents = allStudents.filter((s) => s.firstLoginAt).length;
  const neverLoggedInStudents = allStudents.length - loggedInStudents;

  const webSlug = ENROLLABLE_PROGRAM_SLUGS[0];
  const appSlug = ENROLLABLE_PROGRAM_SLUGS[1];
  const webStudents = allStudents.filter((s) => s.programSlug === webSlug).length;
  const appStudents = allStudents.filter((s) => s.programSlug === appSlug).length;

  const firstTimeRegistrations =
    programStats.approvedRegistrations - programStats.returningRegistrations;

  const approvedForRevenue = allEnrollments.filter((e) => e.status === "approved");
  const revenue = revenueFromStudents(excludeDemoEnrollments(approvedForRevenue).length);

  const phase1Enrollments = allEnrollments.filter((e) => getRegistrationPhase(e) === "phase-1");
  const phase2Enrollments = allEnrollments.filter((e) => getRegistrationPhase(e) === "phase-2");

  const phase1Students = allStudents.filter((s) => getRegistrationPhase(s) === "phase-1");
  const phase2Students = allStudents.filter((s) => getRegistrationPhase(s) === "phase-2");

  const buildPhaseMetrics = (
    enrollmentsList: typeof allEnrollments,
    studentsList: typeof allStudents
  ): PhaseMetrics => {
    const approved = enrollmentsList.filter((row) => row.status === "approved");
    const pending = enrollmentsList.filter((row) => row.status === "pending").length;
    const approvedEmails = new Set(approved.map((row) => row.email.toLowerCase()));
    const returning = Math.max(0, approved.length - approvedEmails.size);
    const firstTime = Math.max(0, approved.length - returning);
    const rev = revenueFromStudents(excludeDemoEnrollments(approved).length).gross;
    const loggedIn = studentsList.filter((s) => s.firstLoginAt).length;
    const web = studentsList.filter((s) => s.programSlug === webSlug).length;
    const app = studentsList.filter((s) => s.programSlug === appSlug).length;

    return {
      totalEnrollments: enrollmentsList.length,
      approvedEnrollments: approved.length,
      pendingEnrollments: pending,
      students: studentsList.length,
      firstTimeRegistrations: firstTime,
      returningRegistrations: returning,
      estimatedRevenue: rev,
      loggedInStudents: loggedIn,
      webStudents: web,
      appStudents: app,
    };
  };

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
    phaseBreakdown: {
      phase1: buildPhaseMetrics(phase1Enrollments, phase1Students),
      phase2: buildPhaseMetrics(phase2Enrollments, phase2Students),
    },
  };
}
