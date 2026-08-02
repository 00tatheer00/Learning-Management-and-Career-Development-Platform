import "server-only";

import {
  getApprovedEnrollmentLevels,
  getApprovedEnrollmentLevelsAllPrograms,
} from "@/lib/auth/student-module-sync";
import { getApprovedProgramSlugs } from "@/lib/student-portal/program-scope";
import type { StudentModuleContentContext } from "@/lib/modules/student-module-content";
import type { PortalUser } from "@/types/portal";

/**
 * Builds the module content context for a student.
 * Now aggregates approved levels across ALL enrolled programs
 * so content filtering works correctly for multi-program students.
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

  // If enrolled in multiple programs, aggregate levels across all of them
  const approvedLevels =
    allProgramSlugs.length > 1
      ? await getApprovedEnrollmentLevelsAllPrograms(user.email, allProgramSlugs)
      : user.email
        ? await getApprovedEnrollmentLevels(user.email, programSlug)
        : [];

  return {
    programSlug,
    studentLevel: user.level?.trim() || null,
    approvedLevels,
    email: user.email,
  };
}
