import { prisma } from "@/lib/prisma";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { excludeDemoEnrollments } from "@/lib/constants/demo-student";
import { calculateTotalRevenue } from "@/lib/constants/revenue-split";

export const PHASE_2_START_ISO = "2026-07-23T19:00:00.000Z";
export const PHASE_2_START_DATE = new Date(PHASE_2_START_ISO);

export type RegistrationPhase = "phase-1" | "phase-2";
export type PhaseFilter = "all" | "phase-1" | "phase-2";

/**
 * PhaseService — ADMISSIONS DOMAIN AUTHORITY
 *
 * Single source of truth for calculating admissions phase based strictly on registration date.
 * Admission statistics (Total, Pending, Approved, Rejected, Phase 1 vs 2, Registration Revenue)
 * derive EXCLUSIVELY from the Enrollment registration table.
 *
 * Phase 1: registrations before 24 July 2026 00:00 PKT
 * Phase 2: registrations on or after 24 July 2026 00:00 PKT
 */
export function getRegistrationPhase(item: {
  createdAt?: string | Date | null;
  appliedAt?: string | Date | null;
  batch?: string | null;
} | Date | string | null | undefined): RegistrationPhase {
  if (!item) return "phase-1";

  let dateVal: Date | null = null;
  if (item instanceof Date) {
    dateVal = item;
  } else if (typeof item === "string") {
    dateVal = new Date(item);
  } else if (typeof item === "object") {
    const raw = item.createdAt || item.appliedAt;
    if (raw) {
      dateVal = raw instanceof Date ? raw : new Date(raw);
    }
  }

  if (dateVal && !isNaN(dateVal.getTime())) {
    return dateVal.getTime() >= PHASE_2_START_DATE.getTime() ? "phase-2" : "phase-1";
  }

  // Fallback for mock objects in tests without a date
  if (typeof item === "object" && item !== null && !(item instanceof Date)) {
    if (item.batch?.includes("Phase 2") || item.batch?.includes("2nd Module")) {
      return "phase-2";
    }
  }

  return "phase-1";
}

/**
 * Returns Prisma filter condition for createdAt field based on phase.
 */
export function getPhaseCreatedAtFilter(phase?: PhaseFilter) {
  if (!phase || phase === "all") return undefined;
  if (phase === "phase-2") {
    return { gte: PHASE_2_START_DATE };
  }
  return { lt: PHASE_2_START_DATE };
}

export interface CentralPhaseMetrics {
  totalEnrollments: number;
  approvedEnrollments: number;
  pendingEnrollments: number;
  rejectedEnrollments: number;
  students: number;
  firstTimeRegistrations: number;
  returningRegistrations: number;
  estimatedRevenue: number;
  loggedInStudents: number;
  neverLoggedInStudents: number;
  webStudents: number;
  appStudents: number;
}

export function computeMetricsFromData(
  enrollments: Array<{
    id: string;
    email: string;
    status: string;
    program: string;
    createdAt: Date;
  }>,
  allStudentUsers: Array<{
    id: string;
    email: string;
    firstLoginAt: Date | null;
    programSlug: string | null;
  }>,
  isPhaseFiltered = false
): CentralPhaseMetrics {
  const totalEnrollments = enrollments.length;
  const pendingEnrollments = enrollments.filter((e) => e.status === "pending").length;
  const approved = enrollments.filter((e) => e.status === "approved");
  const approvedEnrollments = approved.length;
  const rejectedEnrollments = enrollments.filter((e) => e.status === "rejected").length;

  const approvedEmails = new Set(approved.map((e) => e.email.trim().toLowerCase()));
  const returningRegistrations = Math.max(0, approved.length - approvedEmails.size);
  const firstTimeRegistrations = Math.max(0, approved.length - returningRegistrations);

  // Revenue derived strictly from approved registrations
  const paidApproved = excludeDemoEnrollments(approved);
  const revenueObj = calculateTotalRevenue(
    paidApproved.map((row) => ({
      program: row.program,
      programSlug: row.program,
      createdAt: row.createdAt,
    }))
  );
  const estimatedRevenue = revenueObj.gross;

  // Student accounts strictly tied to approved registrations
  let studentUsers: Array<{
    id: string;
    email: string;
    firstLoginAt: Date | null;
    programSlug: string | null;
  }> = [];

  if (approvedEmails.size > 0) {
    studentUsers = allStudentUsers.filter((s) =>
      approvedEmails.has(s.email.trim().toLowerCase())
    );
  } else if (!isPhaseFiltered) {
    studentUsers = allStudentUsers;
  }

  const studentsCount = studentUsers.length;
  const loggedInStudents = studentUsers.filter((s) => Boolean(s.firstLoginAt)).length;

  const webSlug = ENROLLABLE_PROGRAM_SLUGS[0];
  const appSlug = ENROLLABLE_PROGRAM_SLUGS[1];
  const webStudents = studentUsers.filter((s) => s.programSlug === webSlug).length;
  const appStudents = studentUsers.filter((s) => s.programSlug === appSlug).length;
  const neverLoggedInStudents = Math.max(0, studentsCount - loggedInStudents);

  return {
    totalEnrollments,
    approvedEnrollments,
    pendingEnrollments,
    rejectedEnrollments,
    students: studentsCount,
    firstTimeRegistrations,
    returningRegistrations,
    estimatedRevenue,
    loggedInStudents,
    neverLoggedInStudents,
    webStudents,
    appStudents,
  };
}

/**
 * Computes all phase metrics (all, phase-1, phase-2) in a single database pass.
 */
export async function getAllPhaseMetrics(): Promise<{
  all: CentralPhaseMetrics;
  phase1: CentralPhaseMetrics;
  phase2: CentralPhaseMetrics;
}> {
  const [enrollments, allStudentUsers] = await Promise.all([
    prisma.enrollment.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        program: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "student", isActive: true },
      select: {
        id: true,
        email: true,
        firstLoginAt: true,
        programSlug: true,
      },
    }),
  ]);

  const p2Time = PHASE_2_START_DATE.getTime();
  const phase1Enrollments = enrollments.filter(
    (e) => new Date(e.createdAt).getTime() < p2Time
  );
  const phase2Enrollments = enrollments.filter(
    (e) => new Date(e.createdAt).getTime() >= p2Time
  );

  return {
    all: computeMetricsFromData(enrollments, allStudentUsers, false),
    phase1: computeMetricsFromData(phase1Enrollments, allStudentUsers, true),
    phase2: computeMetricsFromData(phase2Enrollments, allStudentUsers, true),
  };
}

/**
 * Computes consistent metrics for a specific phase filter.
 */
export async function getCentralPhaseMetrics(phase: PhaseFilter): Promise<CentralPhaseMetrics> {
  const allMetrics = await getAllPhaseMetrics();
  if (phase === "phase-1") return allMetrics.phase1;
  if (phase === "phase-2") return allMetrics.phase2;
  return allMetrics.all;
}
