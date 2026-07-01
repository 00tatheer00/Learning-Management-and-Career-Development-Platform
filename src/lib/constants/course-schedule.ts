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
    headline: "Classes start Monday, 6 July 2026, InshAllah.",
    daysLabel: "Monday · Tuesday · Wednesday",
    startDateLabel: "From Monday, 6 July 2026",
    subline:
      "Live classes on Mon, Tue & Wed. Exact class time will be shared soon — join your WhatsApp group for updates.",
  },
  "app-development": {
    programLabel: "App Development",
    headline: "Classes start Friday, 3 July 2026, InshAllah.",
    daysLabel: "Friday · Saturday · Sunday",
    startDateLabel: "From Friday, 3 July 2026",
    subline:
      "Live classes on Fri, Sat & Sun. Check your WhatsApp group for timing and join links.",
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
