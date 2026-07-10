import { prisma } from "@/lib/prisma";
import { resendStudentLoginWhatsApp } from "@/lib/notifications/student-login-whatsapp";
import { getAdminCredentialRows } from "@/lib/api/admin-credentials";

export async function bulkResendLoginWhatsApp(options: {
  studentIds?: string[];
  neverLoggedInOnly?: boolean;
}): Promise<{
  attempted: number;
  sent: number;
  skipped: number;
  errors: string[];
}> {
  let rows = await getAdminCredentialRows();

  if (options.studentIds?.length) {
    const idSet = new Set(options.studentIds);
    rows = rows.filter((row) => idSet.has(row.id));
  }

  if (options.neverLoggedInOnly) {
    rows = rows.filter((row) => !row.hasLoggedIn);
  }

  rows = rows.filter((row) => row.hasStoredPassword);

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const result = await resendStudentLoginWhatsApp(row.id);
    if (result.success) {
      sent += 1;
    } else {
      skipped += 1;
      errors.push(`${row.name}: ${result.error ?? "Failed"}`);
    }

    // Pace bulk sends to stay within Meta rate limits.
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  return {
    attempted: rows.length,
    sent,
    skipped,
    errors,
  };
}

export async function getNeverLoggedInStudentIds(): Promise<string[]> {
  const students = await prisma.user.findMany({
    where: { role: "student", isActive: true, firstLoginAt: null },
    select: { id: true },
  });
  return students.map((s) => s.id);
}
