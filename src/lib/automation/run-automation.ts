import { runClassReminders } from "@/lib/automation/class-reminders";
import { ensureScheduledLiveSessions } from "@/lib/sessions/ensure-scheduled-sessions";

export interface AutomationRunSummary {
  ranAt: string;
  scheduledSessions: { created: number; skipped: number };
  classReminders: { thirtyMin: number };
  neverLoggedIn: { studentNudges: number; adminDigestSent: boolean };
  assignmentDueReminders: number;
  inactiveStudentAlerts: number;
  welcomeSequence: { day1: number; day3: number };
  pendingRegistrationSla: boolean;
}

/** Student emails: class reminders (30 min). WhatsApp: approve/reject only. */
export async function runAllAutomations(now = new Date()): Promise<AutomationRunSummary> {
  const scheduledSessions = await ensureScheduledLiveSessions(now);
  const classReminders = await runClassReminders(now);

  return {
    ranAt: now.toISOString(),
    scheduledSessions,
    classReminders,
    neverLoggedIn: { studentNudges: 0, adminDigestSent: false },
    assignmentDueReminders: 0,
    inactiveStudentAlerts: 0,
    welcomeSequence: { day1: 0, day3: 0 },
    pendingRegistrationSla: false,
  };
}
