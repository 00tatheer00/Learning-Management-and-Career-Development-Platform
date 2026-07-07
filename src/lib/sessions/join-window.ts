export {
  parseSessionDateTime,
  DEFAULT_SESSION_TIMEZONE,
} from "@/lib/sessions/live-session-datetime";

/** Students can join any time the trainer has added a link. */
export function isWithinJoinWindow(
  _date: string,
  _time: string,
  _now = new Date()
): boolean {
  return true;
}
