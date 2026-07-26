import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

export const DEFAULT_BATCH_NAME = "Batch 1";

// Date when Phase 2 admissions officially opened (24th July 2026 00:00 PKT)
export const PHASE_2_START_ISO = "2026-07-23T19:00:00.000Z";

export type RegistrationPhase = "phase-1" | "phase-2";

export function getBatchForProgram(programSlug: string): string {
  if (ENROLLABLE_PROGRAM_SLUGS.includes(programSlug as (typeof ENROLLABLE_PROGRAM_SLUGS)[number])) {
    return DEFAULT_BATCH_NAME;
  }
  return DEFAULT_BATCH_NAME;
}

export function getRegistrationPhase(item: {
  createdAt?: string | Date | null;
  appliedAt?: string | Date | null;
  batch?: string | null;
  level?: string | null;
  module?: string | null;
}): RegistrationPhase {
  if (!item) return "phase-1";

  // 1. Explicit Phase 2 in batch label
  if (
    item.batch?.includes("Phase 2") ||
    item.batch?.includes("2nd Module")
  ) {
    return "phase-2";
  }

  // 2. Strictly check applications / accounts created on or after Phase 2 start date (July 24, 2026)
  const dateVal = item.createdAt || item.appliedAt;
  if (dateVal) {
    const createdDate = new Date(dateVal);
    const phase2Start = new Date(PHASE_2_START_ISO);
    if (!isNaN(createdDate.getTime()) && createdDate.getTime() >= phase2Start.getTime()) {
      return "phase-2";
    }
  }

  return "phase-1";
}

export function getPhaseInfo(phase: RegistrationPhase) {
  if (phase === "phase-2") {
    return {
      id: "phase-2" as const,
      label: "Phase 2 (2nd Module)",
      shortLabel: "Phase 2",
      subtitle: "2nd Module Registrations",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    };
  }
  return {
    id: "phase-1" as const,
    label: "Phase 1 (Module 1)",
    shortLabel: "Phase 1",
    subtitle: "Module 1 (HTML & CSS)",
    badgeClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  };
}

