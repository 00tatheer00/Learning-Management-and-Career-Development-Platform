import type { EnrollableProgramSlug } from "@/lib/constants/program-categories";

export interface ProgramClassConfig {
  startDate: string;
  classDays: number[];
  startTime: string;
  endTime: string;
  timeLabel: string;
  daysLabel: string;
  programTitle: string;
}

export const PROGRAM_CLASS_CONFIG: Record<EnrollableProgramSlug, ProgramClassConfig> = {
  "web-development": {
    startDate: "2026-07-06",
    classDays: [1, 2, 3],
    startTime: "22:00",
    endTime: "23:00",
    timeLabel: "10:00 PM – 11:00 PM",
    daysLabel: "Monday · Tuesday · Wednesday",
    programTitle: "Web Development",
  },
  "app-development": {
    startDate: "2026-07-03",
    classDays: [5, 6, 0],
    startTime: "20:00",
    endTime: "21:30",
    timeLabel: "8:00 PM – 9:30 PM",
    daysLabel: "Friday · Saturday · Sunday",
    programTitle: "App Development",
  },
};

export function isScheduledProgram(slug: string): slug is EnrollableProgramSlug {
  return slug in PROGRAM_CLASS_CONFIG;
}
