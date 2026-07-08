import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { updateUserPasswordHash } from "@/lib/auth/users";
import {
  decryptPortalPassword,
  savePortalPasswordForEnrollment,
} from "@/lib/auth/portal-password-vault";
import { getProgramModuleNames } from "@/lib/modules/student-module-access";
import { generateStudentPassword } from "@/lib/auth/generate-password";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function safeStringEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

async function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  return prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, passwordHash: true, isActive: true, role: true },
  });
}

async function getApprovedEnrollmentsForEmail(email: string) {
  const normalized = normalizeEmail(email);
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "approved" },
    select: {
      id: true,
      email: true,
      level: true,
      program: true,
      portalPasswordEnc: true,
      reviewedAt: true,
      createdAt: true,
    },
  });

  return enrollments.filter((entry) => normalizeEmail(entry.email) === normalized);
}

export async function issueEnrollmentLoginPassword(input: {
  studentId: string;
  enrollmentId: string;
  plainPassword: string;
  syncAccountHash?: boolean;
}): Promise<{ ok: boolean; error?: string; vaultSaved: boolean; hashSynced: boolean }> {
  const plainPassword = input.plainPassword.trim();
  if (!plainPassword) {
    return { ok: false, error: "Password is empty", vaultSaved: false, hashSynced: false };
  }

  const syncAccountHash = input.syncAccountHash !== false;
  let hashSynced = false;

  if (syncAccountHash) {
    const passwordHash = await hashPassword(plainPassword);
    await updateUserPasswordHash(input.studentId, passwordHash);
    hashSynced = true;

    const user = await prisma.user.findUnique({
      where: { id: input.studentId },
      select: { passwordHash: true },
    });
    if (!user || !(await verifyPassword(plainPassword, user.passwordHash))) {
      return {
        ok: false,
        error: "Login hash was not saved correctly",
        vaultSaved: false,
        hashSynced: false,
      };
    }
  }

  const vaultResult = await savePortalPasswordForEnrollment(input.enrollmentId, plainPassword);
  if (!vaultResult.saved) {
    return {
      ok: syncAccountHash,
      error: vaultResult.error ?? "Could not save password to module vault",
      vaultSaved: false,
      hashSynced,
    };
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: input.enrollmentId },
    select: { portalPasswordEnc: true },
  });
  const decrypted = decryptPortalPassword(enrollment?.portalPasswordEnc);
  if (!decrypted || !safeStringEqual(decrypted, plainPassword)) {
    return {
      ok: false,
      error: "Saved module password could not be verified",
      vaultSaved: false,
      hashSynced,
    };
  }

  return { ok: true, vaultSaved: true, hashSynced };
}

export async function verifyStudentLoginPassword(
  email: string,
  password: string
): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = password.trim();
  if (!normalizedPassword) return false;

  const user = await findUserByEmail(normalizedEmail);
  if (!user || user.role !== "student" || !user.isActive) return false;

  if (await verifyPassword(normalizedPassword, user.passwordHash)) {
    return true;
  }

  const enrollments = await getApprovedEnrollmentsForEmail(normalizedEmail);
  for (const enrollment of enrollments) {
    const stored = decryptPortalPassword(enrollment.portalPasswordEnc);
    if (stored && safeStringEqual(stored, normalizedPassword)) {
      return true;
    }
  }

  return false;
}

export async function repairStudentLoginPasswords(email: string): Promise<{
  repaired: number;
  passwords: Array<{ enrollmentId: string; module: string; password: string }>;
  errors: string[];
}> {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);
  if (!user || user.role !== "student") {
    return { repaired: 0, passwords: [], errors: ["Student account not found"] };
  }

  const enrollments = await getApprovedEnrollmentsForEmail(normalizedEmail);
  if (enrollments.length === 0) {
    return { repaired: 0, passwords: [], errors: ["No approved enrollments found"] };
  }

  const sorted = [...enrollments].sort((a, b) => {
    const order = getProgramModuleNames(a.program);
    const moduleDiff = order.indexOf(a.level) - order.indexOf(b.level);
    if (moduleDiff !== 0) return moduleDiff;
    const aTime = a.reviewedAt ?? a.createdAt;
    const bTime = b.reviewedAt ?? b.createdAt;
    return aTime.getTime() - bTime.getTime();
  });

  const passwords: Array<{ enrollmentId: string; module: string; password: string }> = [];
  const errors: string[] = [];
  let repaired = 0;

  for (const enrollment of sorted) {
    let plainPassword = decryptPortalPassword(enrollment.portalPasswordEnc);
    let generated = false;

    if (!plainPassword) {
      plainPassword = generateStudentPassword();
      generated = true;
    }

    const issue = await issueEnrollmentLoginPassword({
      studentId: user.id,
      enrollmentId: enrollment.id,
      plainPassword,
      syncAccountHash: false,
    });

    if (!issue.ok) {
      errors.push(`${enrollment.level}: ${issue.error ?? "repair failed"}`);
      continue;
    }

    if (generated) repaired += 1;
    passwords.push({
      enrollmentId: enrollment.id,
      module: enrollment.level,
      password: plainPassword,
    });
  }

  const primary = passwords[0];
  if (primary) {
    const primaryIssue = await issueEnrollmentLoginPassword({
      studentId: user.id,
      enrollmentId: primary.enrollmentId,
      plainPassword: primary.password,
      syncAccountHash: true,
    });
    if (!primaryIssue.ok) {
      errors.push(`Primary login sync failed: ${primaryIssue.error ?? "unknown error"}`);
    }
  }

  return { repaired, passwords, errors };
}

export async function getDecryptedEnrollmentPassword(
  enrollmentId: string
): Promise<string | null> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { portalPasswordEnc: true },
  });
  return decryptPortalPassword(enrollment?.portalPasswordEnc);
}
