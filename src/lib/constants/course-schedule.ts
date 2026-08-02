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
    headline: "Module 2 (JavaScript) classes start 10th August 2026, InshAllah.",
    daysLabel: "Monday · Tuesday · Wednesday",
    startDateLabel: "Module 2 Starts 10th August 2026",
    subline:
      "Live classes on Mon, Tue & Wed (10:00 PM – 11:00 PM). Join your WhatsApp group for live session links.",
  },
  "app-development": {
    programLabel: "App Development",
    headline: "Module 2 (Flutter) classes start 7th August 2026, InshAllah.",
    daysLabel: "Friday · Saturday · Sunday",
    startDateLabel: "Module 2 Starts 7th August 2026",
    subline:
      "Live classes on Fri, Sat & Sun (8:00 PM – 9:30 PM). Join your WhatsApp group for live session links.",
  },
  "artificial-intelligence": {
    programLabel: "Artificial Intelligence",
    headline: "First class starts 7th August 2026, InshAllah.",
    daysLabel: "Friday · Saturday · Sunday",
    startDateLabel: "Starting 7th August 2026",
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

