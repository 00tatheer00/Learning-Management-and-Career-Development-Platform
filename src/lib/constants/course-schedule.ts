import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

export interface ProgramClassSchedule {
  programLabel: string;
  headline: string;
  subline: string;
  daysLabel: string;
  startDateLabel: string;
}

export const PROGRAM_CLASS_SCHEDULE: Record<
  "web-development" | "app-development",
  ProgramClassSchedule
> = {
  "web-development": STUDENT_UR.schedule.web,
  "app-development": STUDENT_UR.schedule.app,
};

export function getProgramClassSchedule(
  programSlug?: string | null
): ProgramClassSchedule {
  if (programSlug === "app-development") {
    return PROGRAM_CLASS_SCHEDULE["app-development"];
  }
  return PROGRAM_CLASS_SCHEDULE["web-development"];
}

/** @deprecated Use getProgramClassSchedule(programSlug) */
export const MODULE_1_CLASS_START = {
  moduleLabel: "Module 1",
  startDateLabel: "6 July 2026",
  headline: PROGRAM_CLASS_SCHEDULE["web-development"].headline,
  subline: PROGRAM_CLASS_SCHEDULE["web-development"].subline,
} as const;
