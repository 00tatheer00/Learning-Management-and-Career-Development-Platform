import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

export const DEFAULT_BATCH_NAME = "Batch 1";

// Date when 2nd Module admissions officially opened
export const PHASE_2_START_ISO = "2026-07-24T00:00:00.000Z";

export type RegistrationPhase = "phase-1" | "phase-2";

export function getBatchForProgram(programSlug: string): string {
  if (ENROLLABLE_PROGRAM_SLUGS.includes(programSlug as (typeof ENROLLABLE_PROGRAM_SLUGS)[number])) {
    return DEFAULT_BATCH_NAME;
  }
  return DEFAULT_BATCH_NAME;
}

export function getRegistrationPhase(item: {
  createdAt?: string | Date | null;
  batch?: string | null;
  level?: string | null;
}): RegistrationPhase {
  if (
    item.batch?.includes("Phase 2") ||
    item.batch?.includes("2nd Module")
  ) {
    return "phase-2";
  }

  if (item.createdAt) {
    const createdDate = new Date(item.createdAt);
    const phase2Start = new Date(PHASE_2_START_ISO);
    if (!isNaN(createdDate.getTime()) && createdDate >= phase2Start) {
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

