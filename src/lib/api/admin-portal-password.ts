import { prisma } from "@/lib/prisma";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";

async function getApprovedEnrollmentsForStudentEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const enrollments = await prisma.enrollment.findMany({
    where: { status: "approved" },
    orderBy: { reviewedAt: "desc" },
    select: {
      portalPasswordEnc: true,
      program: true,
      reviewedAt: true,
      email: true,
      whatsapp: true,
      level: true,
    },
  });

  return enrollments.filter((entry) => entry.email.trim().toLowerCase() === normalized);
}

function pickEnrollment<T extends { program: string; portalPasswordEnc: string | null }>(
  enrollments: T[],
  programSlug: string | null | undefined
): T | undefined {
  if (enrollments.length === 0) return undefined;
  if (programSlug) {
    const match = enrollments.find((entry) => entry.program === programSlug);
    if (match) return match;
  }
  return enrollments.find((entry) => entry.portalPasswordEnc) ?? enrollments[0];
}

function decryptFromEnrollments(
  enrollments: Array<{ portalPasswordEnc: string | null }>
): string | null {
  for (const enrollment of enrollments) {
    if (!enrollment.portalPasswordEnc) continue;
    const password = decryptPortalPassword(enrollment.portalPasswordEnc);
    if (password) return password;
  }
  return null;
}

export async function revealStudentPortalPassword(studentId: string): Promise<{
  password: string | null;
  error?: string;
}> {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student || student.role !== "student") {
    return { password: null, error: "Student not found" };
  }

  const enrollments = await getApprovedEnrollmentsForStudentEmail(student.email);
  if (enrollments.length === 0) {
    return { password: null, error: "No approved registration found" };
  }

  const preferred = pickEnrollment(enrollments, student.programSlug);
  const ordered = preferred
    ? [preferred, ...enrollments.filter((entry) => entry !== preferred)]
    : enrollments;

  const password = decryptFromEnrollments(ordered);
  if (password) {
    return { password };
  }

  const hasStoredPassword = ordered.some((entry) => entry.portalPasswordEnc);
  if (!hasStoredPassword) {
    return { password: null, error: "Password not saved for this student" };
  }

  return {
    password: null,
    error: "Could not decrypt stored password. Use Reset password to generate a new one.",
  };
}

export async function getStudentPortalPasswordForWhatsApp(studentId: string): Promise<{
  password: string | null;
  enrollment: (Awaited<ReturnType<typeof getApprovedEnrollmentsForStudentEmail>>)[number] | null;
  student: { name: string; email: string; phone: string | null; programSlug: string | null; level: string | null };
  error?: string;
}> {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      role: true,
      name: true,
      email: true,
      phone: true,
      programSlug: true,
      level: true,
    },
  });

  if (!student || student.role !== "student") {
    return {
      password: null,
      enrollment: null,
      student: { name: "", email: "", phone: null, programSlug: null, level: null },
      error: "Student not found",
    };
  }

  const enrollments = await getApprovedEnrollmentsForStudentEmail(student.email);
  const enrollment = pickEnrollment(enrollments, student.programSlug) ?? null;
  if (!enrollment) {
    return {
      password: null,
      enrollment: null,
      student,
      error: "No approved registration found for this student",
    };
  }

  const password = decryptFromEnrollments(
    enrollment.portalPasswordEnc ? [enrollment, ...enrollments] : enrollments
  );

  if (!password) {
    return {
      password: null,
      enrollment,
      student,
      error: "Login password not saved. Use Portal Logins → Generate & Save, then resend.",
    };
  }

  return { password, enrollment, student };
}
