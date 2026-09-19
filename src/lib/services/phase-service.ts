import { prisma } from "@/lib/prisma";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { excludeDemoEnrollments } from "@/lib/constants/demo-student";
import { calculateTotalRevenue } from "@/lib/constants/revenue-split";

export const PHASE_2_START_ISO = "2026-07-23T19:00:00.000Z";
export const PHASE_2_START_DATE = new Date(PHASE_2_START_ISO);

export const PHASE_3_START_ISO = "2026-08-28T19:00:00.000Z";
export const PHASE_3_START_DATE = new Date(PHASE_3_START_ISO);

export const PHASE_4_START_ISO = "2026-09-18T19:00:00.000Z";
export const PHASE_4_START_DATE = new Date(PHASE_4_START_ISO);

export type RegistrationPhase = "phase-1" | "phase-2" | "phase-3" | "phase-4";
export type PhaseFilter = "all" | "phase-1" | "phase-2" | "phase-3" | "phase-4";

export function getProgramsForPhase(phase: PhaseFilter): readonly string[] {
  switch (phase) {
    case "phase-1":
      return ["web-development", "app-development"] as const;
    case "phase-2":
      return ["web-development", "app-development", "artificial-intelligence"] as const;
    case "phase-3":
      return ["web-development", "app-development", "artificial-intelligence"] as const;
    case "phase-4":
      return ["digital-marketing", "ecommerce", "graphics-designing"] as const;
    case "all":
    default:
      return ENROLLABLE_PROGRAM_SLUGS;
  }
}

/**
 * PhaseService — ADMISSIONS DOMAIN AUTHORITY
 *
 * Single source of truth for calculating admissions phase based strictly on registration date.
 * Admission statistics (Total, Pending, Approved, Rejected, Phase 1 vs 2 vs 3, Registration Revenue)
 * derive EXCLUSIVELY from the Enrollment registration table.
 *
 * Phase 1: registrations before 24 July 2026 00:00 PKT
 * Phase 2: registrations from 24 July 2026 00:00 PKT to before 29 August 2026 00:00 PKT
 * Phase 3: registrations on or after 29 August 2026 00:00 PKT
 */
export function getRegistrationPhase(item: {
  createdAt?: string | Date | null;
  appliedAt?: string | Date | null;
  batch?: string | null;
  program?: string | null;
  programSlug?: string | null;
  level?: string | null;
  module?: string | null;
} | Date | string | null | undefined): RegistrationPhase {
  if (!item) return "phase-1";

  // 1. If program is Digital Marketing, Ecommerce, or Graphics Designing, it is strictly Phase 4
  if (typeof item === "object" && !(item instanceof Date)) {
    const rawProgram = (item.program || item.programSlug || "").trim().toLowerCase();
    const rawLevel = (item.level || item.module || "").trim().toLowerCase();
    const rawBatch = (item.batch || "").trim().toLowerCase();

    if (
      rawProgram === "digital-marketing" ||
      rawProgram === "ecommerce" ||
      rawProgram === "graphics-designing" ||
      rawProgram.includes("digital marketing") ||
      rawProgram.includes("ecommerce") ||
      rawProgram.includes("graphic") ||
      rawBatch.includes("phase 4") ||
      rawBatch.includes("4th module") ||
      rawLevel.includes("4th module")
    ) {
      return "phase-4";
    }

    // 2. Phase 3: Web & App 3rd module, and AI 2nd module ONLY
    const isWeb =
      rawProgram === "web-development" ||
      rawProgram.includes("web");
    const isWeb3rd =
      isWeb &&
      (rawLevel.includes("react") ||
        rawLevel.includes("3rd module") ||
        rawLevel.includes("module 3"));

    const isApp =
      rawProgram === "app-development" ||
      rawProgram.includes("app") ||
      rawProgram.includes("flutter");
    const isApp3rd =
      isApp &&
      (rawLevel.includes("firebase") ||
        rawLevel.includes("api") ||
        rawLevel.includes("3rd module") ||
        rawLevel.includes("module 3"));

    const isAI =
      rawProgram === "artificial-intelligence" ||
      rawProgram.includes("ai") ||
      rawProgram.includes("artificial");
    const isAI2nd =
      isAI &&
      (rawLevel.includes("module 2") ||
        rawLevel.includes("data to ml") ||
        rawLevel.includes("ml engineer") ||
        rawLevel.includes("2nd module"));

    if (isWeb3rd || isApp3rd || isAI2nd || rawBatch.includes("phase 3") || rawBatch.includes("3rd module")) {
      return "phase-3";
    }
  }

  // Extract date if available
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
    const time = dateVal.getTime();
    const p2Time = PHASE_2_START_DATE.getTime();
    const p3Time = PHASE_3_START_DATE.getTime();
    const p4Time = PHASE_4_START_DATE.getTime();

    if (time < p2Time) {
      return "phase-1";
    }
    if (time < p3Time) {
      return "phase-2";
    }

    // If an object with explicit level reached here without matching Phase 3/4
    if (typeof item === "object" && !(item instanceof Date)) {
      const rawLevel = (item.level || item.module || "").trim().toLowerCase();

      if (
        rawLevel.includes("javascript") ||
        rawLevel.includes("flutter frontend") ||
        rawLevel.includes("2nd module")
      ) {
        return "phase-2";
      }

      if (
        rawLevel.includes("html") ||
        rawLevel.includes("dart") ||
        rawLevel.includes("launchpad") ||
        rawLevel.includes("1st module") ||
        rawLevel.includes("module 1")
      ) {
        return "phase-1";
      }
    }

    if (time >= p4Time) {
      return "phase-4";
    }

    // Fallback for date-only calls
    return "phase-3";
  }

  // Fallback for mock objects without dates
  if (typeof item === "object" && !(item instanceof Date)) {
    const rawBatch = (item.batch || "").trim().toLowerCase();
    const rawLevel = (item.level || item.module || "").trim().toLowerCase();

    if (
      rawBatch.includes("phase 2") ||
      rawBatch.includes("2nd module") ||
      rawLevel.includes("javascript") ||
      rawLevel.includes("flutter frontend")
    ) {
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
  if (phase === "phase-4") {
    return { gte: PHASE_4_START_DATE };
  }
  if (phase === "phase-3") {
    return { gte: PHASE_3_START_DATE, lt: PHASE_4_START_DATE };
  }
  if (phase === "phase-2") {
    return { gte: PHASE_2_START_DATE, lt: PHASE_3_START_DATE };
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
 * Computes all phase metrics (all, phase-1, phase-2, phase-3) in a single database pass.
 */
export async function getAllPhaseMetrics(): Promise<{
  all: CentralPhaseMetrics;
  phase1: CentralPhaseMetrics;
  phase2: CentralPhaseMetrics;
  phase3: CentralPhaseMetrics;
  phase4: CentralPhaseMetrics;
}> {
  const [enrollments, allStudentUsers] = await Promise.all([
    prisma.enrollment.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        program: true,
        level: true,
        batch: true,
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

  const phase1Enrollments = enrollments.filter((e) => getRegistrationPhase(e) === "phase-1");
  const phase2Enrollments = enrollments.filter((e) => getRegistrationPhase(e) === "phase-2");
  const phase3Enrollments = enrollments.filter((e) => getRegistrationPhase(e) === "phase-3");
  const phase4Enrollments = enrollments.filter((e) => getRegistrationPhase(e) === "phase-4");

  return {
    all: computeMetricsFromData(enrollments, allStudentUsers, false),
    phase1: computeMetricsFromData(phase1Enrollments, allStudentUsers, true),
    phase2: computeMetricsFromData(phase2Enrollments, allStudentUsers, true),
    phase3: computeMetricsFromData(phase3Enrollments, allStudentUsers, true),
    phase4: computeMetricsFromData(phase4Enrollments, allStudentUsers, true),
  };
}

/**
 * Computes consistent metrics for a specific phase filter.
 */
export async function getCentralPhaseMetrics(phase: PhaseFilter): Promise<CentralPhaseMetrics> {
  const allMetrics = await getAllPhaseMetrics();
  if (phase === "phase-1") return allMetrics.phase1;
  if (phase === "phase-2") return allMetrics.phase2;
  if (phase === "phase-3") return allMetrics.phase3;
  if (phase === "phase-4") return allMetrics.phase4;
  return allMetrics.all;
}
