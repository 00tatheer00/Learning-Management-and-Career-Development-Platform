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
  "web-development": {
    programLabel: "Web Development",
    headline: "Classes are starting from 6th July 2026, InshAllah.",
    daysLabel: "Monday · Tuesday · Wednesday",
    startDateLabel: "Starting from 6th July 2026",
    subline:
      "Live classes on Mon, Tue & Wed. Exact class time will be shared soon — join your WhatsApp group for updates.",
  },
  "app-development": {
    programLabel: "App Development",
    headline: "Classes started from 3rd July 2026, Alhamdulillah.",
    daysLabel: "Friday · Saturday · Sunday",
    startDateLabel: "Started from 3rd July 2026",
    subline:
      "Live classes on Fri, Sat & Sun. Join your WhatsApp group for class timing and live session links.",
  },
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
