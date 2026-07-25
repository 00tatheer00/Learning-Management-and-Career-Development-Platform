export interface ProgramClassSchedule {
  programLabel: string;
  headline: string;
  subline: string;
  daysLabel: string;
  startDateLabel: string;
}

export const PROGRAM_CLASS_SCHEDULE: Record<
  "web-development" | "app-development" | "artificial-intelligence",
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
  "artificial-intelligence": {
    programLabel: "Artificial Intelligence",
    headline: "Classes schedule: Friday · Saturday · Sunday (10:00 PM – 11:30 PM).",
    daysLabel: "Friday · Saturday · Sunday",
    startDateLabel: "Starting Soon",
    subline:
      "Live classes on Fri, Sat & Sun from 10:00 PM to 11:30 PM (PKT). Join your WhatsApp group for class timing and live session links.",
  },
};

export function getProgramClassSchedule(
  programSlug?: string | null
): ProgramClassSchedule {
  if (programSlug === "app-development") {
    return PROGRAM_CLASS_SCHEDULE["app-development"];
  }
  if (programSlug === "artificial-intelligence") {
    return PROGRAM_CLASS_SCHEDULE["artificial-intelligence"];
  }
  return PROGRAM_CLASS_SCHEDULE["web-development"];
}

