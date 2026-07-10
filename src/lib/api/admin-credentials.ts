import { prisma } from "@/lib/prisma";
import { getUserByEmail, updateUser } from "@/lib/auth/users";
import {
  DEMO_STUDENT_USER_ID,
  ensureDemoStudentForPortalLogins,
  isPrimaryDemoEnrollment,
} from "@/lib/api/demo-student-credentials";
import { isDemoEnrollment } from "@/lib/constants/demo-student";
import { getProgramBySlug } from "@/lib/data/programs";
import { getPortalLoginUrl } from "@/lib/site-url";

export interface AdminCredentialRow {
  /** Approved enrollment id (unique row key). */
  id: string;
  /** Portal user id for account-level actions. */
  studentId: string;
  name: string;
  email: string;
  whatsapp: string;
  course: string;
  programSlug: string;
  module: string;
  batch: string;
  password: string | null;
  hasStoredPassword: boolean;
  hasLoggedIn: boolean;
  firstLoginAt: string | null;
  lastLoginAt: string | null;
  approvedAt: string | null;
  loginUrl: string;
  isDemo: boolean;
}

export async function getAdminCredentialRows(): Promise<AdminCredentialRow[]> {
  const demoUserId = await ensureDemoStudentForPortalLogins();

  const loginUrl = getPortalLoginUrl();
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "approved" },
    orderBy: [{ reviewedAt: "desc" }, { createdAt: "desc" }],
  });

  if (enrollments.length === 0) return [];

  const displayEnrollments = enrollments.filter((enrollment) => {
    if (!isDemoEnrollment(enrollment)) return true;
    return isPrimaryDemoEnrollment(enrollment);
  });

  const emails = [...new Set(displayEnrollments.map((entry) => entry.email.toLowerCase()))];
  const students = await prisma.user.findMany({
    where: { role: "student", email: { in: emails } },
  });
  const studentByEmail = new Map(students.map((student) => [student.email.toLowerCase(), student]));

  const rows: AdminCredentialRow[] = [];

  for (const enrollment of displayEnrollments) {
    const demo = isDemoEnrollment(enrollment);
    const student = studentByEmail.get(enrollment.email.toLowerCase());

    if (!student && !demo) continue;

    const programSlug = enrollment.program;
    const course = getProgramBySlug(programSlug)?.title ?? programSlug;

    rows.push({
      id: enrollment.id,
      studentId: student?.id ?? demoUserId ?? DEMO_STUDENT_USER_ID,
      name: enrollment.fullName || student?.name || "Demo Student",
      email: student?.email ?? enrollment.email,
      whatsapp: student?.phone ?? enrollment.whatsapp ?? "—",
      course,
      programSlug,
      module: demo ? "All modules (demo)" : enrollment.level,
      batch: enrollment.batch ?? "—",
      password: null,
      hasStoredPassword: Boolean(enrollment.portalPasswordEnc),
      hasLoggedIn: Boolean(student?.firstLoginAt),
      firstLoginAt: student?.firstLoginAt?.toISOString() ?? null,
      lastLoginAt: student?.lastLoginAt?.toISOString() ?? null,
      approvedAt: enrollment.reviewedAt?.toISOString() ?? student?.createdAt.toISOString() ?? null,
      loginUrl,
      isDemo: demo,
    });
  }

  return rows;
}

export async function updateStudentLoginDetails(
  studentId: string,
  updates: { email?: string; phone?: string }
): Promise<{ success: boolean; error?: string; message?: string; email?: string; phone?: string }> {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student || student.role !== "student") {
    return { success: false, error: "Student not found" };
  }

  let nextEmail = student.email;
  let nextPhone = student.phone ?? undefined;

  const emailInput = updates.email?.trim().toLowerCase();
  if (emailInput && emailInput !== student.email.toLowerCase()) {
    const existing = await getUserByEmail(emailInput);
    if (existing && existing.id !== studentId) {
      return { success: false, error: "This login ID (email) is already in use." };
    }

    const oldEmail = student.email.toLowerCase();
    await prisma.user.update({
      where: { id: studentId },
      data: { email: emailInput },
    });
    await prisma.enrollment.updateMany({
      where: { email: oldEmail },
      data: { email: emailInput },
    });
    nextEmail = emailInput;
  }

  if (updates.phone !== undefined) {
    const trimmed = updates.phone.trim();
    await updateUser(studentId, { phone: trimmed || undefined });
    nextPhone = trimmed || undefined;
  }

  return {
    success: true,
    message: "Login details updated.",
    email: nextEmail,
    phone: nextPhone ?? "",
  };
}
