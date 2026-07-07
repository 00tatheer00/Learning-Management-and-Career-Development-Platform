import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateStudentPassword } from "@/lib/auth/generate-password";
import { savePortalPasswordForEnrollment } from "@/lib/auth/portal-password-vault";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";
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
      const saved = await savePortalPasswordForEnrollment(row.id, plainPassword);
      if (saved) {
        generated += 1;
      } else {
        errors.push(`${row.name} (${row.module}): password not saved to vault`);
      }
    } catch (error) {
      errors.push(
        `${row.name} (${row.module}): ${error instanceof Error ? error.message : "failed"}`
      );
    }
  }

  return { generated, skipped, errors };
}
