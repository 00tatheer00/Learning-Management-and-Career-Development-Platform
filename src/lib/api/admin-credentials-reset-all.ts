import { prisma } from "@/lib/prisma";
import { generateStudentPassword } from "@/lib/auth/generate-password";
import { issueEnrollmentLoginPassword } from "@/lib/auth/student-login-password";
import { savePortalPasswordForStudentEmail } from "@/lib/auth/portal-password-vault";
import { getAdminCredentialRows } from "@/lib/api/admin-credentials";

/**
 * Reset passwords for ALL approved students.
 * Groups by student email so each student gets ONE new password across all modules.
 */
export async function resetAllStudentPasswords(): Promise<{
  reset: number;
  total: number;
  errors: string[];
}> {
  const rows = await getAdminCredentialRows();
  const errors: string[] = [];

  // Group by student email — one password per student
  const byEmail = new Map<
    string,
    { studentId: string; name: string; enrollmentIds: string[] }
  >();

  for (const row of rows) {
    const email = row.email.toLowerCase();
    const existing = byEmail.get(email);
    if (existing) {
      existing.enrollmentIds.push(row.id);
    } else {
      byEmail.set(email, {
        studentId: row.studentId,
        name: row.name,
        enrollmentIds: [row.id],
      });
    }
  }

  let reset = 0;

  for (const [email, group] of byEmail) {
    try {
      const plainPassword = generateStudentPassword();

      // Issue password for the first enrollment with syncAccountHash: true
      const firstEnrollmentId = group.enrollmentIds[0]!;
      const firstIssue = await issueEnrollmentLoginPassword({
        studentId: group.studentId,
        enrollmentId: firstEnrollmentId,
        plainPassword,
        syncAccountHash: true,
      });

      if (!firstIssue.ok) {
        errors.push(`${group.name} (${email}): ${firstIssue.error ?? "reset failed"}`);
        continue;
      }

      // Save the same password for all other enrollments of this student
      if (group.enrollmentIds.length > 1) {
        await savePortalPasswordForStudentEmail(email, plainPassword);
      }

      // Reset the portal welcome so they see it again
      for (const enrollmentId of group.enrollmentIds) {
        await prisma.enrollment.update({
          where: { id: enrollmentId },
          data: { portalWelcomeShownAt: null },
        }).catch(() => {
          // non-critical, just skip
        });
      }

      reset += 1;
    } catch (error) {
      errors.push(
        `${group.name} (${email}): ${error instanceof Error ? error.message : "failed"}`
      );
    }
  }

  return { reset, total: byEmail.size, errors };
}
