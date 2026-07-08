import { prisma } from "@/lib/prisma";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";
import { getProgramBySlug } from "@/lib/data/programs";
import {
  canAccessModuleOneClasses,
  getProgramModuleNames,
  isFirstModuleStudent,
} from "@/lib/modules/student-module-access";
import { getPortalLoginUrl } from "@/lib/site-url";

export interface StudentModuleEnrollmentView {
  enrollmentId: string;
  moduleName: string;
  programSlug: string;
  courseTitle: string;
  loginId: string;
  password: string | null;
  loginUrl: string;
  approvedAt: string | null;
  canJoinLiveClasses: boolean;
}

export async function getStudentModuleEnrollmentViews(
  email: string,
  programSlug: string
): Promise<StudentModuleEnrollmentView[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      program: programSlug,
      status: "approved",
    },
    orderBy: { reviewedAt: "asc" },
    select: {
      id: true,
      email: true,
      level: true,
      program: true,
      portalPasswordEnc: true,
      reviewedAt: true,
    },
  });

  const normalizedEmail = email.trim().toLowerCase();
  const approvedForStudent = enrollments.filter(
    (enrollment) => enrollment.email.trim().toLowerCase() === normalizedEmail
  );

  const order = getProgramModuleNames(programSlug);
  const sorted = [...approvedForStudent].sort(
    (a, b) => order.indexOf(a.level) - order.indexOf(b.level)
  );

  const loginUrl = getPortalLoginUrl();
  const courseTitle = getProgramBySlug(programSlug)?.title ?? programSlug;

  return sorted.map((enrollment) => ({
    enrollmentId: enrollment.id,
    moduleName: enrollment.level,
    programSlug: enrollment.program,
    courseTitle,
    loginId: email.trim().toLowerCase(),
    password: decryptPortalPassword(enrollment.portalPasswordEnc),
    loginUrl,
    approvedAt: enrollment.reviewedAt?.toISOString() ?? null,
    canJoinLiveClasses: isFirstModuleStudent(programSlug, enrollment.level),
  }));
}

export { verifyStudentLoginPassword } from "@/lib/auth/student-login-password";

export function studentHasLiveClassAccess(
  programSlug: string,
  moduleViews: StudentModuleEnrollmentView[]
): boolean {
  return moduleViews.some((view) =>
    canAccessModuleOneClasses(programSlug, view.moduleName, moduleViews.map((v) => v.moduleName))
  );
}
