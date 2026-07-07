import { prisma } from "@/lib/prisma";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";

export async function revealStudentPortalPassword(studentId: string): Promise<{
  password: string | null;
  error?: string;
}> {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student || student.role !== "student") {
    return { password: null, error: "Student not found" };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { email: student.email.toLowerCase(), status: "approved" },
    orderBy: { reviewedAt: "desc" },
    select: { portalPasswordEnc: true, program: true, reviewedAt: true },
  });

  if (enrollments.length === 0) {
    return { password: null, error: "No approved registration found" };
  }

  const enrollment =
    enrollments.find((entry) => entry.program === student.programSlug) ?? enrollments[0];

  if (!enrollment?.portalPasswordEnc) {
    return { password: null, error: "Password not saved for this student" };
  }

  const password = decryptPortalPassword(enrollment.portalPasswordEnc);
  if (!password) {
    return { password: null, error: "Could not decrypt stored password" };
  }

  return { password };
}
