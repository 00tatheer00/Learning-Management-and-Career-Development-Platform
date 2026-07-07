import { prisma } from "@/lib/prisma";
import { getUserByEmail, updateUser } from "@/lib/auth/users";
import { getProgramBySlug } from "@/lib/data/programs";
import { getPortalLoginUrl } from "@/lib/site-url";

export interface AdminCredentialRow {
  id: string;
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
}

export async function getAdminCredentialRows(): Promise<AdminCredentialRow[]> {
  const loginUrl = getPortalLoginUrl();
  const students = await prisma.user.findMany({
    where: { role: "student" },
    orderBy: { createdAt: "desc" },
  });

  if (students.length === 0) return [];

  const emails = students.map((student) => student.email.toLowerCase());
  const enrollments = await prisma.enrollment.findMany({
    where: { email: { in: emails }, status: "approved" },
    orderBy: { reviewedAt: "desc" },
  });

  const enrollmentByEmail = new Map<string, (typeof enrollments)[number][]>();
  for (const enrollment of enrollments) {
    const key = enrollment.email.toLowerCase();
    const list = enrollmentByEmail.get(key) ?? [];
    list.push(enrollment);
    enrollmentByEmail.set(key, list);
  }

  return students.map((student) => {
    const approved = enrollmentByEmail.get(student.email.toLowerCase()) ?? [];
    const enrollment =
      approved.find((entry) => entry.program === student.programSlug) ?? approved[0];
    const programSlug = student.programSlug ?? enrollment?.program ?? "";
    const course = getProgramBySlug(programSlug)?.title ?? (programSlug || "—");

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      whatsapp: student.phone ?? enrollment?.whatsapp ?? "—",
      course,
      programSlug,
      module: student.level ?? enrollment?.level ?? "—",
      batch: student.batch ?? enrollment?.batch ?? "—",
      password: null,
      hasStoredPassword: Boolean(enrollment?.portalPasswordEnc),
      hasLoggedIn: Boolean(student.firstLoginAt),
      firstLoginAt: student.firstLoginAt?.toISOString() ?? null,
      lastLoginAt: student.lastLoginAt?.toISOString() ?? null,
      approvedAt: enrollment?.reviewedAt?.toISOString() ?? student.createdAt.toISOString(),
      loginUrl,
    };
  });
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
