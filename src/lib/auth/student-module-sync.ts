import { prisma } from "@/lib/prisma";
import {
  getProgramModuleNames,
  resolveActiveStudentModule,
  resolveCanonicalModule,
} from "@/lib/modules/student-module-access";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import { DEMO_STUDENT_PROGRAM_SLUGS, getApprovedProgramSlugs } from "@/lib/student-portal/program-scope";
import { isAllModulesLevel } from "@/lib/modules/student-module-content";

import { normalizeProgramSlug, resolveTrainerIdForProgram } from "@/lib/auth/program-assignment";

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

  const isUserInProgram = Boolean(
    userRecord && normalizeProgramSlug(userRecord.programSlug ?? "") === normSlug
  );

  // If student has full course / all modules access in enrollment, moduleEnrollment, or user record
  const hasAllAccess =
    studentEnrollmentRows.some((r) => isAllModulesLevel(r.level)) ||
    studentModuleRows.some((r) => isAllModulesLevel(r.moduleName)) ||
    (isUserInProgram && isAllModulesLevel(userRecord?.level));

  const order = getProgramModuleNames(normSlug);
  if (hasAllAccess && order.length > 0) {
    return [...order];
  }

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

  if (isUserInProgram && userRecord?.level?.trim()) {
    const canonical = resolveCanonicalModule(normSlug, userRecord.level.trim());
    if (canonical) lowerLevels.add(canonical.trim().toLowerCase());
    lowerLevels.add(userRecord.level.trim().toLowerCase());
  }

  const matched = order.filter((moduleName) => lowerLevels.has(moduleName.trim().toLowerCase()));

  // STRICT ACCESS CONTROL:
  // Only unlock modules the student has explicitly enrolled in and been approved for.
  // Never automatically grant Module 1 or un-enrolled modules to students who did not admit in them.
  if (matched.length > 0) {
    return matched;
  }

  // If the student enrolled in an explicit level string that didn't match canonical order,
  // return only the explicitly enrolled level(s). Never grant default access to un-enrolled modules.
  if (lowerLevels.size > 0) {
    return Array.from(lowerLevels);
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
  const userLevelNorm = user.level?.trim().toLowerCase();
  const isLevelInCurrentProgram =
    userLevelNorm &&
    approvedLevels.some((l) => l.trim().toLowerCase() === userLevelNorm);

  // If user's level is not in the current program's approved levels, check if it belongs to another approved program
  if (!isLevelInCurrentProgram && userLevelNorm) {
    const allSlugs = await getApprovedProgramSlugs(user.email);
    for (const slug of allSlugs) {
      if (slug === user.programSlug) continue;
      const otherLevels = await getApprovedEnrollmentLevels(user.email, slug);
      if (otherLevels.some((l) => l.trim().toLowerCase() === userLevelNorm)) {
        const trainerId = await resolveTrainerIdForProgram(slug);
        await prisma.user.update({
          where: { id: userId },
          data: {
            programSlug: slug,
            ...(trainerId ? { trainerId } : {}),
          },
        });
        return user.level;
      }
    }
  }

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
