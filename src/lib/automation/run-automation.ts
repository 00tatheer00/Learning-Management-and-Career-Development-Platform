import { runClassReminders } from "@/lib/automation/class-reminders";
import { runNeverLoggedInNudges } from "@/lib/automation/never-logged-in-nudge";
import { runAssignmentDueReminders } from "@/lib/automation/assignment-due-reminders";
import { runInactiveStudentAlerts } from "@/lib/automation/inactive-student-alerts";
import { runWelcomeSequence } from "@/lib/automation/welcome-sequence";
import { runPendingRegistrationSla } from "@/lib/automation/pending-registration-sla";

export interface AutomationRunSummary {
  ranAt: string;
  classReminders: { oneHour: number; fifteenMin: number };
  neverLoggedIn: { studentNudges: number; adminDigestSent: boolean };
  assignmentDueReminders: number;
  inactiveStudentAlerts: number;
  welcomeSequence: { day1: number; day3: number };
  pendingRegistrationSla: boolean;
}

export async function runAllAutomations(now = new Date()): Promise<AutomationRunSummary> {
  const [
    classReminders,
    neverLoggedIn,
    assignmentDueReminders,
    inactiveStudentAlerts,
    welcomeSequence,
    pendingRegistrationSla,
  ] = await Promise.all([
    runClassReminders(now),
    runNeverLoggedInNudges(now),
    runAssignmentDueReminders(now),
    runInactiveStudentAlerts(now),
    runWelcomeSequence(now),
    runPendingRegistrationSla(now),
  ]);

  return {
    ranAt: now.toISOString(),
    classReminders,
    neverLoggedIn,
    assignmentDueReminders,
    inactiveStudentAlerts,
    welcomeSequence,
    pendingRegistrationSla,
  };
}
