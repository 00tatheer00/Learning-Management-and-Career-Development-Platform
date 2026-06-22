import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateStudentPassword } from "@/lib/auth/generate-password";
import { savePortalPasswordForStudentEmail } from "@/lib/auth/portal-password-vault";
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
      const existing = decryptPortalPassword(
        (
          await prisma.enrollment.findFirst({
            where: { email: row.email.toLowerCase(), status: "approved" },
            orderBy: { reviewedAt: "desc" },
            select: { portalPasswordEnc: true },
          })
        )?.portalPasswordEnc
      );
      if (existing) {
        skipped += 1;
        continue;
      }

      const plainPassword = generateStudentPassword();
      await prisma.user.update({
        where: { id: row.id },
        data: { passwordHash: await hashPassword(plainPassword) },
      });
      const saved = await savePortalPasswordForStudentEmail(row.email, plainPassword);
      if (saved) {
        generated += 1;
      } else {
        errors.push(`${row.name}: password not saved to vault`);
      }
    } catch (error) {
      errors.push(
        `${row.name}: ${error instanceof Error ? error.message : "failed"}`
      );
    }
  }

  return { generated, skipped, errors };
}
