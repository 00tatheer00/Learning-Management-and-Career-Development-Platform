import { prisma } from "@/lib/prisma";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { updateUserPasswordHash } from "@/lib/auth/users";

export async function syncStudentLoginHashesFromVault(): Promise<{
  synced: number;
  skipped: number;
  errors: string[];
}> {
  const students = await prisma.user.findMany({
    where: { role: "student", isActive: true },
    select: { id: true, email: true, passwordHash: true },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: {
      status: "approved",
      portalPasswordEnc: { not: null },
    },
    select: {
      email: true,
      portalPasswordEnc: true,
      reviewedAt: true,
    },
    orderBy: { reviewedAt: "desc" },
  });

  const enrollmentsByEmail = new Map<string, typeof enrollments>();
  for (const enrollment of enrollments) {
    const key = enrollment.email.trim().toLowerCase();
    const list = enrollmentsByEmail.get(key) ?? [];
    list.push(enrollment);
    enrollmentsByEmail.set(key, list);
  }

  let synced = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const student of students) {
    try {
      const studentEnrollments =
        enrollmentsByEmail.get(student.email.trim().toLowerCase()) ?? [];

      if (studentEnrollments.length === 0) {
        skipped += 1;
        continue;
      }

      let passwordToSync: string | null = null;

      for (const enrollment of studentEnrollments) {
        const plain = decryptPortalPassword(enrollment.portalPasswordEnc);
        if (!plain) continue;

        if (await verifyPassword(plain, student.passwordHash)) {
          passwordToSync = null;
          break;
        }

        if (!passwordToSync) {
          passwordToSync = plain;
        }
      }

      if (!passwordToSync) {
        skipped += 1;
        continue;
      }

      await updateUserPasswordHash(student.id, await hashPassword(passwordToSync));
      synced += 1;
    } catch (error) {
      errors.push(
        `${student.email}: ${error instanceof Error ? error.message : "failed"}`
      );
    }
  }

  return { synced, skipped, errors };
}
