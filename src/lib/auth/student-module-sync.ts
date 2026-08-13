import { prisma } from "@/lib/prisma";
import {
  getProgramModuleNames,
  resolveActiveStudentModule,
} from "@/lib/modules/student-module-access";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import { DEMO_STUDENT_PROGRAM_SLUGS } from "@/lib/student-portal/program-scope";

import { normalizeProgramSlug } from "@/lib/auth/program-assignment";

export async function getApprovedEnrollmentLevels(
  email: string,
  programSlug: string
): Promise<string[]> {
  if (isDemoPortalStudent(email)) {
    return DEMO_STUDENT_PROGRAM_SLUGS.flatMap((slug) => getProgramModuleNames(slug));
  }

  const normSlug = normalizeProgramSlug(programSlug);
  const normalizedEmail = email.trim().toLowerCase();

  const [enrollmentRows, moduleEnrollmentRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        status: "approved",
      },
      select: { program: true, level: true, email: true },
    }),
    prisma.moduleEnrollment.findMany({
      where: {
        status: "active",
      },
      select: { programSlug: true, moduleName: true, email: true },
    }),
  ]);

  const studentEnrollmentRows = enrollmentRows.filter(
    (row) =>
      row.email &&
      row.email.trim().toLowerCase() === normalizedEmail &&
      normalizeProgramSlug(row.program) === normSlug
  );

  const studentModuleRows = moduleEnrollmentRows.filter(
    (row) =>
      row.email &&
      row.email.trim().toLowerCase() === normalizedEmail &&
      normalizeProgramSlug(row.programSlug) === normSlug
  );

  const order = getProgramModuleNames(normSlug);
  const lowerLevels = new Set<string>();

  for (const row of studentEnrollmentRows) {
    if (row.level?.trim()) lowerLevels.add(row.level.trim().toLowerCase());
  }
  for (const row of studentModuleRows) {
    if (row.moduleName?.trim()) lowerLevels.add(row.moduleName.trim().toLowerCase());
  }

  return order.filter((moduleName) => lowerLevels.has(moduleName.trim().toLowerCase()));
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
