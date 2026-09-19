import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

export const DEFAULT_BATCH_NAME = "Batch 1";

// Date when Phase 2 admissions officially opened (24th July 2026 00:00 PKT)
export const PHASE_2_START_ISO = "2026-07-23T19:00:00.000Z";

// Date when Phase 3 admissions officially opened (29th August 2026 00:00 PKT)
export const PHASE_3_START_ISO = "2026-08-28T19:00:00.000Z";

// Date when Phase 4 admissions officially opened (19th September 2026 00:00 PKT)
export const PHASE_4_START_ISO = "2026-09-18T19:00:00.000Z";

export type RegistrationPhase = "phase-1" | "phase-2" | "phase-3" | "phase-4";

export function getBatchForProgram(programSlug: string): string {
  if (ENROLLABLE_PROGRAM_SLUGS.includes(programSlug as (typeof ENROLLABLE_PROGRAM_SLUGS)[number])) {
    return DEFAULT_BATCH_NAME;
  }
  return DEFAULT_BATCH_NAME;
}

export function isPhase2Module(level?: string | null): boolean {
  if (!level) return false;
  const trimmed = level.trim().toLowerCase();
  if (
    trimmed === "html & css" ||
    trimmed === "dart & oop" ||
    trimmed.includes("launchpad") ||
    trimmed.includes("module 1")
  ) {
    return false;
  }
  return true;
}

export function getRegistrationPhase(item?: {
  createdAt?: string | Date | null;
  appliedAt?: string | Date | null;
  batch?: string | null;
  program?: string | null;
  programSlug?: string | null;
  level?: string | null;
  module?: string | null;
} | Date | string | null): RegistrationPhase {
  if (!item) return "phase-1";

  // 1. Check if Digital Marketing, Ecommerce, or Graphics Designing (strictly Phase 4 courses)
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

    // 2. Check Phase 3: Web & App 3rd module, and AI 2nd module ONLY
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
    const p2Time = new Date(PHASE_2_START_ISO).getTime();
    const p3Time = new Date(PHASE_3_START_ISO).getTime();
    const p4Time = new Date(PHASE_4_START_ISO).getTime();

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

export function getPhaseInfo(phase: RegistrationPhase) {
  if (phase === "phase-4") {
    return {
      id: "phase-4" as const,
      label: "Phase 4 (Marketing, Ecommerce, Graphics)",
      shortLabel: "Phase 4",
      subtitle: "Digital Marketing, Ecommerce & Graphics Designing",
      badgeClass: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
    };
  }
  if (phase === "phase-3") {
    return {
      id: "phase-3" as const,
      label: "Phase 3 (Web & App 3rd, AI 2nd Module)",
      shortLabel: "Phase 3",
      subtitle: "Web Dev (React), Flutter (Firebase) & AI (Data to ML)",
      badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    };
  }
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
