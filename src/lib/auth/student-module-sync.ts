import { prisma } from "@/lib/prisma";
import {
  getProgramModuleNames,
  resolveActiveStudentModule,
  resolveCanonicalModule,
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

  const [enrollmentRows, moduleEnrollmentRows, userRecord] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        status: "approved",
        email: { equals: normalizedEmail, mode: "insensitive" },
      },
      select: { program: true, level: true, email: true },
    }),
    prisma.moduleEnrollment.findMany({
      where: {
        status: "active",
        email: { equals: normalizedEmail, mode: "insensitive" },
      },
      select: { programSlug: true, moduleName: true, email: true },
    }),
    prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: "insensitive" },
      },
      select: { programSlug: true, level: true },
    }),
  ]);

  const studentEnrollmentRows = enrollmentRows.filter(
    (row) => normalizeProgramSlug(row.program) === normSlug
  );

  const studentModuleRows = moduleEnrollmentRows.filter(
    (row) => normalizeProgramSlug(row.programSlug) === normSlug
  );

  const order = getProgramModuleNames(normSlug);
  const lowerLevels = new Set<string>();

  for (const row of studentEnrollmentRows) {
    if (row.level?.trim()) {
      const canonical = resolveCanonicalModule(normSlug, row.level.trim());
      if (canonical) lowerLevels.add(canonical.trim().toLowerCase());
      lowerLevels.add(row.level.trim().toLowerCase());
    }
  }
  for (const row of studentModuleRows) {
    if (row.moduleName?.trim()) {
      const canonical = resolveCanonicalModule(normSlug, row.moduleName.trim());
      if (canonical) lowerLevels.add(canonical.trim().toLowerCase());
      lowerLevels.add(row.moduleName.trim().toLowerCase());
    }
  }

  if (userRecord && normalizeProgramSlug(userRecord.programSlug ?? "") === normSlug && userRecord.level?.trim()) {
    const canonical = resolveCanonicalModule(normSlug, userRecord.level.trim());
    if (canonical) lowerLevels.add(canonical.trim().toLowerCase());
    lowerLevels.add(userRecord.level.trim().toLowerCase());
  }

  const matched = order.filter((moduleName) => lowerLevels.has(moduleName.trim().toLowerCase()));

  // Ensure foundational Module 1 is always accessible for any student enrolled in this course
  if (order.length > 0 && (matched.length > 0 || studentEnrollmentRows.length > 0 || studentModuleRows.length > 0)) {
    if (!matched.includes(order[0])) {
      matched.unshift(order[0]);
    }
    return matched;
  }

  // Fallback: if student has an approved enrollment for this program but string didn't match directly, default to first module
  if (studentEnrollmentRows.length > 0 && order.length > 0) {
    return [order[0]];
  }

  return [];
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
