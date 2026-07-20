import {
  PROGRAM_CLASS_CONFIG,
  isScheduledProgram,
  type ProgramClassConfig,
} from "@/lib/class-schedule/config";
import {
  addDaysToYmd,
  formatYmdInPakistan,
  getPakistanTimeMinutes,
  getTodayYmdInPakistan,
  getWeekdayFromYmd,
  parseTimeToMinutes,
} from "@/lib/utils/pakistan-time";

export type ClassSlotStatus = "done" | "today" | "live" | "upcoming";

export interface ClassSlot {
  classNumber: number;
  date: string;
  weekdayLabel: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  timeLabel: string;
  status: ClassSlotStatus;
}

function getSlotStatus(
  slot: Pick<ClassSlot, "date" | "startTime" | "endTime">,
  now: Date
): ClassSlotStatus {
  const today = getTodayYmdInPakistan(now);
  if (slot.date < today) return "done";
  if (slot.date > today) return "upcoming";

  const minutes = getPakistanTimeMinutes(now);
  const start = parseTimeToMinutes(slot.startTime);
  const end = parseTimeToMinutes(slot.endTime);
  if (minutes < start) return "today";
  if (minutes <= end) return "live";
  return "done";
}

export function generateClassSlots(
  programSlug: string,
  options?: { maxClasses?: number; now?: Date }
): ClassSlot[] {
  if (!isScheduledProgram(programSlug)) return [];

  const config = PROGRAM_CLASS_CONFIG[programSlug];
  const now = options?.now ?? new Date();
  const maxClasses = options?.maxClasses ?? 60;
  const slots: ClassSlot[] = [];
  let cursor = config.startDate;
  let classNumber = 0;
  const endCursor = addDaysToYmd(config.startDate, 140);

  while (classNumber < maxClasses && cursor <= endCursor) {
    if (config.classDays.includes(getWeekdayFromYmd(cursor))) {
      classNumber += 1;
      const base = {
        classNumber,
        date: cursor,
        weekdayLabel: formatYmdInPakistan(cursor, { weekday: true }).split(",")[0] ?? "",
        dateLabel: formatYmdInPakistan(cursor, { month: "short" }),
        startTime: config.startTime,
        endTime: config.endTime,
        timeLabel: config.timeLabel,
      };
      slots.push({ ...base, status: getSlotStatus(base, now) });
    }
    cursor = addDaysToYmd(cursor, 1);
  }

  return slots;
}

export function getClassProgress(programSlug: string, now = new Date()) {
  const slots = generateClassSlots(programSlug, { now });
  const config = isScheduledProgram(programSlug) ? PROGRAM_CLASS_CONFIG[programSlug] : null;
  const completed = slots.filter((s) => s.status === "done");
  const todaySlot = slots.find((s) => s.status === "today" || s.status === "live") ?? null;
  const liveSlot = slots.find((s) => s.status === "live") ?? null;
  const upcoming = slots.filter((s) => s.status === "upcoming");
  const nextTwo = upcoming.slice(0, 2);
  const currentClassNumber = todaySlot?.classNumber ?? completed.length;

  return {
    slots,
    config,
    completed,
    todaySlot,
    liveSlot,
    upcoming,
    nextTwo,
    currentClassNumber,
    completedCount: completed.length,
  };
}

export function getProgramClassConfig(programSlug: string): ProgramClassConfig | null {
  return isScheduledProgram(programSlug) ? PROGRAM_CLASS_CONFIG[programSlug] : null;
}

export function getClassSlotLabel(slot: ClassSlot): string {
  if (slot.status === "done") return `Class ${slot.classNumber} · Done`;
  if (slot.status === "live") return `Class ${slot.classNumber} · Live now`;
  if (slot.status === "today") return `Class ${slot.classNumber} · Today`;
  return `Class ${slot.classNumber} · Upcoming`;
}
