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
      // Check if already sent successfully for any of the student's enrollments
      const alreadySent = await prisma.enrollment.findFirst({
        where: {
          id: { in: group.enrollmentIds },
          approvalEmailSent: true,
        },
      });

      if (alreadySent) {
        continue;
      }

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

      // Add a small 150ms delay before calling Resend to prevent rate limit (10req/sec)
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = await sendStudentLoginEmail({
        fullName: group.name,
        email: group.email,
        program: group.programSlug,
        level: group.level,
        password,
      });

      if (result.sent) {
        sent += 1;
        await prisma.enrollment.updateMany({
          where: { id: { in: group.enrollmentIds } },
          data: {
            approvalEmailSent: true,
            approvalEmailError: null,
          },
        });
      } else {
        failed += 1;
        errors.push(`${group.name} (${group.email}): ${result.error ?? "email failed"}`);
        await prisma.enrollment.updateMany({
          where: { id: { in: group.enrollmentIds } },
          data: {
            approvalEmailSent: false,
            approvalEmailError: result.error ?? "email failed",
          },
        });
      }
    } catch (error) {
      failed += 1;
      const errMsg = error instanceof Error ? error.message : "failed";
      errors.push(`${group.name} (${group.email}): ${errMsg}`);
      try {
        await prisma.enrollment.updateMany({
          where: { id: { in: group.enrollmentIds } },
          data: {
            approvalEmailSent: false,
            approvalEmailError: errMsg,
          },
        });
      } catch (dbErr) {
        console.error("Failed to update enrollment error status in db:", dbErr);
      }
    }
  }

  return { sent, failed, skippedNoPassword, errors };
}
