import "server-only";

import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";
import { getApprovedProgramSlugs } from "@/lib/student-portal/program-scope";
import { resolveCanonicalModule } from "@/lib/modules/student-module-access";
import { normalizeModuleName } from "@/lib/modules/student-module-content";

/**
 * Returns a map of programSlug → approved module names for a student.
 * This is the single source of truth for which modules a student can access.
 */
export async function getStudentAdmittedModulesByProgram(
  email: string
): Promise<Map<string, string[]>> {
  const programSlugs = await getApprovedProgramSlugs(email);
  const result = new Map<string, string[]>();

  const entries = await Promise.all(
    programSlugs.map(async (slug) => ({
      slug,
      levels: await getApprovedEnrollmentLevels(email, slug),
    }))
  );

  for (const { slug, levels } of entries) {
    if (levels.length > 0) {
      result.set(slug, levels);
    }
  }

  return result;
}

/**
 * Returns a flat array of all admitted module names across all programs.
 */
export async function getAllAdmittedModuleNames(
  email: string
): Promise<string[]> {
  const byProgram = await getStudentAdmittedModulesByProgram(email);
  const all: string[] = [];
  for (const levels of byProgram.values()) {
    all.push(...levels);
  }
  return [...new Set(all)];
}

/**
 * Checks if a student has access to a specific module within a program.
 */
export async function hasModuleAccess(
  email: string,
  programSlug: string,
  moduleName: string
): Promise<boolean> {
  const approvedLevels = await getApprovedEnrollmentLevels(email, programSlug);
  if (approvedLevels.length === 0) return false;

  const targetCanonical = resolveCanonicalModule(programSlug, moduleName);
  const targetNormalized = normalizeModuleName(targetCanonical);

  return approvedLevels.some((level) => {
    const canonical = resolveCanonicalModule(programSlug, level);
    return (
      normalizeModuleName(canonical) === targetNormalized ||
      normalizeModuleName(level) === targetNormalized
    );
  });
}

/**
 * Checks if a student can access a specific recording based on their
 * module enrollments. The recording must belong to one of the student's
 * approved modules.
 */
export async function canAccessRecording(
  email: string,
  recording: { programSlug: string; level?: string | null }
): Promise<boolean> {
  // Recordings with no module tag are accessible to any enrolled student
  if (!recording.level?.trim()) {
    const programSlugs = await getApprovedProgramSlugs(email);
    return programSlugs.includes(recording.programSlug);
  }

  return hasModuleAccess(email, recording.programSlug, recording.level);
}
