import { prisma } from "@/lib/prisma";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";
import { sendStudentLoginEmail } from "@/lib/notifications/student-login-email";
import { getAdminCredentialRows } from "@/lib/api/admin-credentials";

/**
 * Email login details to ALL approved students.
 * Groups by student email so each student receives ONE email (not one per module).
 */
export async function emailAllStudentLogins(): Promise<{
  sent: number;
  failed: number;
  skippedNoPassword: number;
  errors: string[];
}> {
  const rows = await getAdminCredentialRows();
  const errors: string[] = [];

  // Group by student email — one email per student
  const byEmail = new Map<
    string,
    {
      name: string;
      email: string;
      programSlug: string;
      level: string;
      enrollmentIds: string[];
    }
  >();

  for (const row of rows) {
    const email = row.email.toLowerCase();
    const existing = byEmail.get(email);
    if (existing) {
      existing.enrollmentIds.push(row.id);
    } else {
      byEmail.set(email, {
        name: row.name,
        email: row.email,
        programSlug: row.programSlug,
        level: row.module,
        enrollmentIds: [row.id],
      });
    }
  }

  let sent = 0;
  let failed = 0;
  let skippedNoPassword = 0;

  for (const [, group] of byEmail) {
    try {
      // Find the password from any enrollment for this student
      let password: string | null = null;
      for (const enrollmentId of group.enrollmentIds) {
        const enrollment = await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
          select: { portalPasswordEnc: true },
        });
        password = decryptPortalPassword(enrollment?.portalPasswordEnc);
        if (password) break;
      }

      if (!password) {
        skippedNoPassword += 1;
        errors.push(`${group.name} (${group.email}): no saved password — skipped`);
        continue;
      }

      const result = await sendStudentLoginEmail({
        fullName: group.name,
        email: group.email,
        program: group.programSlug,
        level: group.level,
        password,
      });

      if (result.sent) {
        sent += 1;
      } else {
        failed += 1;
        errors.push(`${group.name} (${group.email}): ${result.error ?? "email failed"}`);
      }
    } catch (error) {
      failed += 1;
      errors.push(
        `${group.name} (${group.email}): ${error instanceof Error ? error.message : "failed"}`
      );
    }
  }

  return { sent, failed, skippedNoPassword, errors };
}
