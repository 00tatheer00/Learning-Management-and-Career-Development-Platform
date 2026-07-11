import "server-only";

import { prisma } from "@/lib/prisma";
import { decryptPortalPassword } from "@/lib/auth/portal-password-vault";
import { getProgramBySlug } from "@/lib/data/programs";
import {
  canAccessModuleOneClasses,
  getProgramModuleNames,
  isFirstModuleStudent,
} from "@/lib/modules/student-module-access";
import {
  studentHasModuleLiveContent,
  type StudentModuleContentContext,
} from "@/lib/modules/student-module-content";
import { getPortalLoginUrl } from "@/lib/site-url";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import { DEMO_STUDENT_PROGRAM_SLUGS } from "@/lib/student-portal/program-scope";

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
  if (isDemoPortalStudent(email)) {
    const merged: StudentModuleEnrollmentView[] = [];
    for (const slug of DEMO_STUDENT_PROGRAM_SLUGS) {
      const loaded = await loadStudentModuleEnrollmentViews(email, slug);
      merged.push(...buildDemoModuleEnrollmentViews(email, slug, loaded));
    }
    return merged;
  }

  return loadStudentModuleEnrollmentViews(email, programSlug);
}

async function loadStudentModuleEnrollmentViews(
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
    canJoinLiveClasses: isDemoPortalStudent(email)
      ? true
      : isFirstModuleStudent(programSlug, enrollment.level),
  }));
}

function buildDemoModuleEnrollmentViews(
  email: string,
  programSlug: string,
  existing: StudentModuleEnrollmentView[]
): StudentModuleEnrollmentView[] {
  const loginUrl = getPortalLoginUrl();
  const courseTitle = getProgramBySlug(programSlug)?.title ?? programSlug;
  const loginId = email.trim().toLowerCase();
  const password = existing.find((view) => view.password)?.password ?? null;
  const byModule = new Map(existing.map((view) => [view.moduleName, view]));

  return getProgramModuleNames(programSlug).map((moduleName, index) => {
    const current = byModule.get(moduleName);
    if (current) {
      return { ...current, canJoinLiveClasses: true };
    }

    return {
      enrollmentId: `demo-${programSlug}-${index}`,
      moduleName,
      programSlug,
      courseTitle,
      loginId,
      password,
      loginUrl,
      approvedAt: null,
      canJoinLiveClasses: true,
    };
  });
}

export { verifyStudentLoginPassword } from "@/lib/auth/student-login-password";

export function studentHasLiveClassAccess(
  programSlug: string,
  moduleViews: StudentModuleEnrollmentView[],
  email?: string | null,
  sessions?: Array<{ level?: string | null }>,
  studentLevel?: string | null
): boolean {
  if (isDemoPortalStudent(email)) return true;

  const context: StudentModuleContentContext = {
    programSlug,
    studentLevel: studentLevel ?? moduleViews[0]?.moduleName ?? null,
    approvedLevels: moduleViews.map((view) => view.moduleName),
    email,
  };

  if (sessions?.length) {
    return studentHasModuleLiveContent(context, sessions);
  }

  return moduleViews.some((view) =>
    canAccessModuleOneClasses(programSlug, view.moduleName, context.approvedLevels, email)
  );
}
