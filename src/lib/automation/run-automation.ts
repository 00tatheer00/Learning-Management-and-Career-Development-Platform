export interface AutomationRunSummary {
  ranAt: string;
  classReminders: { oneHour: number; fifteenMin: number };
  neverLoggedIn: { studentNudges: number; adminDigestSent: boolean };
  assignmentDueReminders: number;
  inactiveStudentAlerts: number;
  welcomeSequence: { day1: number; day3: number };
  pendingRegistrationSla: boolean;
}

/** WhatsApp automation disabled — only manual approve/reject messages are sent. */
export async function runAllAutomations(now = new Date()): Promise<AutomationRunSummary> {
  return {
    ranAt: now.toISOString(),
    classReminders: { oneHour: 0, fifteenMin: 0 },
    neverLoggedIn: { studentNudges: 0, adminDigestSent: false },
    assignmentDueReminders: 0,
    inactiveStudentAlerts: 0,
    welcomeSequence: { day1: 0, day3: 0 },
    pendingRegistrationSla: false,
  };
}
