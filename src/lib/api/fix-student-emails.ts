import { prisma } from "@/lib/prisma";

/** Common email domain typos → correct domain */
const DOMAIN_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaol.com": "gmail.com",
  "gmali.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmsil.com": "gmail.com",
  "gmaiil.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
  "outllook.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outook.com": "outlook.com",
  "hotmal.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
};

function fixEmailAddress(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex < 1) return trimmed;

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  const fixedDomain = DOMAIN_FIXES[domain] ?? domain;
  return `${local}@${fixedDomain}`;
}

export interface EmailFix {
  name: string;
  oldEmail: string;
  newEmail: string;
}

export async function fixStudentEmails(): Promise<{
  fixed: number;
  fixes: EmailFix[];
  errors: string[];
}> {
  const fixes: EmailFix[] = [];
  const errors: string[] = [];

  // ── Fix User emails ──────────────────────────────────────────────────
  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true, email: true },
  });

  for (const student of students) {
    const corrected = fixEmailAddress(student.email);
    if (corrected === student.email.trim().toLowerCase() && corrected === student.email) {
      continue; // no change needed (or only case change already lowercased)
    }

    // Check if the corrected email is already used by someone else
    if (corrected !== student.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: { email: corrected },
        select: { id: true },
      });
      if (existing && existing.id !== student.id) {
        errors.push(
          `${student.name}: cannot fix "${student.email}" → "${corrected}" (email already used)`
        );
        continue;
      }
    }

    try {
      const oldEmail = student.email;

      // Update User email
      await prisma.user.update({
        where: { id: student.id },
        data: { email: corrected },
      });

      // Update all matching Enrollments
      await prisma.enrollment.updateMany({
        where: { email: { in: [oldEmail, oldEmail.toLowerCase(), oldEmail.trim()] } },
        data: { email: corrected },
      });

      fixes.push({ name: student.name, oldEmail, newEmail: corrected });
    } catch (error) {
      errors.push(
        `${student.name}: ${error instanceof Error ? error.message : "update failed"}`
      );
    }
  }

  // ── Fix Enrollment emails that don't have a matching User ─────────
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "approved" },
    select: { id: true, fullName: true, email: true },
  });

  for (const enrollment of enrollments) {
    const corrected = fixEmailAddress(enrollment.email);
    if (corrected === enrollment.email) continue;

    // Skip if already fixed via User pass above
    if (fixes.some((f) => f.oldEmail === enrollment.email)) continue;

    try {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { email: corrected },
      });
      // Only track if not already tracked
      if (!fixes.some((f) => f.name === enrollment.fullName && f.newEmail === corrected)) {
        fixes.push({
          name: enrollment.fullName,
          oldEmail: enrollment.email,
          newEmail: corrected,
        });
      }
    } catch (error) {
      errors.push(
        `${enrollment.fullName} (enrollment): ${error instanceof Error ? error.message : "update failed"}`
      );
    }
  }

  return { fixed: fixes.length, fixes, errors };
}
