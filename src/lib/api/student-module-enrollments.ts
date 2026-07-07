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
      email: email.trim().toLowerCase(),
      program: programSlug,
      status: "approved",
    },
    orderBy: { reviewedAt: "asc" },
    select: {
      id: true,
      level: true,
      program: true,
      portalPasswordEnc: true,
      reviewedAt: true,
    },
  });

  const order = getProgramModuleNames(programSlug);
  const sorted = [...enrollments].sort(
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

export async function verifyStudentLoginPassword(
  email: string,
  password: string
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { passwordHash: true },
  });

  if (!user) return false;

  const { verifyPassword } = await import("@/lib/auth/password");
  if (await verifyPassword(password, user.passwordHash)) {
    return true;
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      email: normalizedEmail,
      status: "approved",
      portalPasswordEnc: { not: null },
    },
    select: { portalPasswordEnc: true },
  });

  for (const enrollment of enrollments) {
    const stored = decryptPortalPassword(enrollment.portalPasswordEnc);
    if (stored && stored === password) {
      return true;
    }
  }

  return false;
}

export function studentHasLiveClassAccess(
  programSlug: string,
  moduleViews: StudentModuleEnrollmentView[]
): boolean {
  return moduleViews.some((view) =>
    canAccessModuleOneClasses(programSlug, view.moduleName, moduleViews.map((v) => v.moduleName))
  );
}
