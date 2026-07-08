import { prisma } from "@/lib/prisma";
import { generateStudentPassword } from "@/lib/auth/generate-password";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";
import { issueEnrollmentLoginPassword } from "@/lib/auth/student-login-password";
import { getAdminCredentialRows } from "@/lib/api/admin-credentials";

export async function generateMissingPortalPasswords(): Promise<{
  generated: number;
  skipped: number;
  errors: string[];
}> {
  const rows = await getAdminCredentialRows();
  const missing = rows.filter((row) => !row.hasStoredPassword);

  let generated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of missing) {
    try {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: row.id },
        select: { portalPasswordEnc: true },
      });

      const existing = decryptPortalPassword(enrollment?.portalPasswordEnc);
      if (existing) {
        skipped += 1;
        continue;
      }

      const plainPassword = generateStudentPassword();
      const issue = await issueEnrollmentLoginPassword({
        studentId: row.studentId,
        enrollmentId: row.id,
        plainPassword,
        syncAccountHash: true,
      });

      if (issue.ok) {
        generated += 1;
      } else {
        errors.push(
          `${row.name} (${row.module}): ${issue.error ?? "password not saved to vault"}`
        );
      }
    } catch (error) {
      errors.push(
        `${row.name} (${row.module}): ${error instanceof Error ? error.message : "failed"}`
      );
    }
  }

  return { generated, skipped, errors };
}
