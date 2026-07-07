import { getProgramClassConfig } from "@/lib/class-schedule";
import { isScheduledProgram } from "@/lib/class-schedule/config";
import {
  DEFAULT_SESSION_TIMEZONE,
  parseSessionDateTime,
  sessionLocalToStartsAt,
} from "@/lib/sessions/live-session-datetime";

export { parseSessionDateTime, DEFAULT_SESSION_TIMEZONE };

/** Join opens this many ms before scheduled class start. */
export const JOIN_OPENS_BEFORE_MS = 10 * 60 * 1000;

const DEFAULT_CLASS_DURATION_MS = 60 * 60 * 1000;

export type JoinWindowPhase = "no_link" | "too_early" | "open" | "ended";

export interface JoinWindowState {
  phase: JoinWindowPhase;
  canJoin: boolean;
  buttonLabel: string;
  hint: string;
  opensAt: Date | null;
  endsAt: Date | null;
}

export function getSessionEndDateTime(
  sessionDate: string,
  programSlug: string,
  timezone: string = DEFAULT_SESSION_TIMEZONE
): Date | null {
  if (isScheduledProgram(programSlug)) {
    const config = getProgramClassConfig(programSlug);
    if (config) {
      return sessionLocalToStartsAt(sessionDate, config.endTime, timezone);
    }
  }
  return null;
}

export function formatJoinTimeInPakistan(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: DEFAULT_SESSION_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getJoinWindowState(input: {
  sessionDate: string;
  sessionTime: string;
  programSlug: string;
  hasJoinLink: boolean;
  now?: Date;
}): JoinWindowState {
  const now = input.now ?? new Date();

  if (!input.hasJoinLink) {
    return {
      phase: "no_link",
      canJoin: false,
      buttonLabel: "Link coming soon",
      hint: "Your trainer has not added the class link yet. Check back before class time.",
      opensAt: null,
      endsAt: null,
    };
  }

  const startsAt = parseSessionDateTime(input.sessionDate, input.sessionTime);
  if (!startsAt) {
    return {
      phase: "ended",
      canJoin: false,
      buttonLabel: "Class Done",
      hint: "This class has ended. Check Class Recordings for the replay.",
      opensAt: null,
      endsAt: null,
    };
  }

  const scheduledEnd =
    getSessionEndDateTime(input.sessionDate, input.programSlug) ??
    new Date(startsAt.getTime() + DEFAULT_CLASS_DURATION_MS);
  const opensAt = new Date(startsAt.getTime() - JOIN_OPENS_BEFORE_MS);
  const nowMs = now.getTime();

  if (nowMs < opensAt.getTime()) {
    return {
      phase: "too_early",
      canJoin: false,
      buttonLabel: "Join Class",
      hint: `Join opens 10 minutes before class — at ${formatJoinTimeInPakistan(opensAt)} PKT (${input.sessionDate} · ${input.sessionTime}).`,
      opensAt,
      endsAt: scheduledEnd,
    };
  }

  if (nowMs > scheduledEnd.getTime()) {
    return {
      phase: "ended",
      canJoin: false,
      buttonLabel: "Class Done",
      hint: "This class has ended. Check Class Recordings for the replay.",
      opensAt,
      endsAt: scheduledEnd,
    };
  }

  return {
    phase: "open",
    canJoin: true,
    buttonLabel: "Join Class",
    hint: "Tap to join Google Meet. Attendance is recorded when you join.",
    opensAt,
    endsAt: scheduledEnd,
  };
}

/** @deprecated Use getJoinWindowState().canJoin */
export function isWithinJoinWindow(
  sessionDate: string,
  sessionTime: string,
  programSlug: string,
  hasJoinLink = true,
  now = new Date()
): boolean {
  return getJoinWindowState({
    sessionDate,
    sessionTime,
    programSlug,
    hasJoinLink,
    now,
  }).canJoin;
}

export function isSessionJoinWindowOpen(
  session: { date: string; time: string; programSlug: string; hasJoinLink?: boolean },
  now = new Date()
): boolean {
  return getJoinWindowState({
    sessionDate: session.date,
    sessionTime: session.time,
    programSlug: session.programSlug,
    hasJoinLink: session.hasJoinLink !== false,
    now,
  }).canJoin;
}

export function isSessionFullyEnded(
  session: { date: string; time: string; programSlug: string },
  now = new Date()
): boolean {
  const state = getJoinWindowState({
    sessionDate: session.date,
    sessionTime: session.time,
    programSlug: session.programSlug,
    hasJoinLink: true,
    now,
  });
  return state.phase === "ended";
}
