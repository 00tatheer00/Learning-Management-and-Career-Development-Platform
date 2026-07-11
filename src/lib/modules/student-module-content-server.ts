import "server-only";

import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";
import type { StudentModuleContentContext } from "@/lib/modules/student-module-content";
import type { PortalUser } from "@/types/portal";

export async function getStudentModuleContentContext(
  user: Pick<PortalUser, "email" | "programSlug" | "level">
): Promise<StudentModuleContentContext> {
  const programSlug = user.programSlug ?? "web-development";
  const approvedLevels = user.email
    ? await getApprovedEnrollmentLevels(user.email, programSlug)
    : [];

  return {
    programSlug,
    studentLevel: user.level?.trim() || null,
    approvedLevels,
    email: user.email,
  };
}
