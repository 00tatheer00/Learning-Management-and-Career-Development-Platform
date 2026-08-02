import "server-only";

import { prisma } from "@/lib/prisma";
import {
  getProgramModuleNames,
  resolveActiveStudentModule,
} from "@/lib/modules/student-module-access";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import { DEMO_STUDENT_PROGRAM_SLUGS } from "@/lib/student-portal/program-scope";

export async function getApprovedEnrollmentLevels(
  email: string,
  programSlug: string
): Promise<string[]> {
  if (isDemoPortalStudent(email)) {
    return DEMO_STUDENT_PROGRAM_SLUGS.flatMap((slug) => getProgramModuleNames(slug));
  }

  const rows = await prisma.enrollment.findMany({
    where: {
      program: programSlug,
      status: "approved",
    },
    select: { level: true, email: true },
  });

  const normalizedEmail = email.trim().toLowerCase();
  const studentRows = rows.filter(
    (row) => row.email && row.email.trim().toLowerCase() === normalizedEmail
  );

  const order = getProgramModuleNames(programSlug);
  const levels = new Set(studentRows.map((row) => row.level.trim()).filter(Boolean));
  return order.filter((moduleName) => levels.has(moduleName));
}

/**
 * Returns approved enrollment levels across ALL programs for a student.
 * Used when the student is enrolled in multiple programs and we need
 * a combined view of all their approved modules.
 */
export async function getApprovedEnrollmentLevelsAllPrograms(
  email: string,
  programSlugs: string[]
): Promise<string[]> {
  if (isDemoPortalStudent(email)) {
    return DEMO_STUDENT_PROGRAM_SLUGS.flatMap((slug) => getProgramModuleNames(slug));
  }

  const results = await Promise.all(
    programSlugs.map((slug) => getApprovedEnrollmentLevels(email, slug))
  );
  return results.flat();
}

export async function syncStudentActiveModuleFromEnrollments(
  userId: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, email: true, programSlug: true, level: true },
  });

  if (!user?.programSlug || user.role !== "student") {
    return user?.level ?? null;
  }

  const approvedLevels = await getApprovedEnrollmentLevels(user.email, user.programSlug);
  if (approvedLevels.length === 0) {
    return user.level;
  }

  const activeModule = resolveActiveStudentModule(
    user.programSlug,
    user.level,
    approvedLevels
  );

  if (!activeModule || activeModule === user.level) {
    return user.level;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { level: activeModule },
  });

  return activeModule;
}
