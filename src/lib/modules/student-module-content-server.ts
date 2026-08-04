import "server-only";

import {
  getApprovedEnrollmentLevels,
} from "@/lib/auth/student-module-sync";
import { getApprovedProgramSlugs } from "@/lib/student-portal/program-scope";
import type { StudentModuleContentContext } from "@/lib/modules/student-module-content";
import type { PortalUser } from "@/types/portal";

/**
 * Builds the module content context for a student.
 * Uses per-program approved levels so content filtering is scoped
 * correctly — a Flutter student only sees Flutter content, etc.
 */
export async function getStudentModuleContentContext(
  user: Pick<PortalUser, "email" | "programSlug" | "level" | "programSlugs">
): Promise<StudentModuleContentContext> {
  const programSlug = user.programSlug ?? "web-development";

  // Get all programs the student is enrolled in
  const allProgramSlugs =
    user.programSlugs && user.programSlugs.length > 0
      ? user.programSlugs
      : await getApprovedProgramSlugs(user.email);

  // Build per-program approved levels map
  const approvedLevelsByProgram: Record<string, string[]> = {};
  if (user.email) {
    const results = await Promise.all(
      allProgramSlugs.map(async (slug) => ({
        slug,
        levels: await getApprovedEnrollmentLevels(user.email, slug),
      }))
    );
    for (const { slug, levels } of results) {
      approvedLevelsByProgram[slug] = levels;
    }
  }

  // Flat list for backward compatibility
  const approvedLevels = Object.values(approvedLevelsByProgram).flat();

  return {
    programSlug,
    programSlugs: allProgramSlugs,
    studentLevel: user.level?.trim() || null,
    approvedLevels,
    approvedLevelsByProgram,
    email: user.email,
  };
}
