import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import type { PortalUser } from "@/types/portal";

/** Demo student sees both active scheduled programs in the portal. */
export const DEMO_STUDENT_PROGRAM_SLUGS = ["web-development", "app-development"] as const;

export function getStudentPortalProgramSlugs(
  user: Pick<PortalUser, "email" | "programSlug">
): string[] {
  if (isDemoPortalStudent(user.email)) {
    return [...DEMO_STUDENT_PROGRAM_SLUGS];
  }
  return [user.programSlug ?? "web-development"];
}

export function canStudentAccessProgram(
  user: Pick<PortalUser, "email" | "programSlug">,
  programSlug: string
): boolean {
  return getStudentPortalProgramSlugs(user).includes(programSlug);
}

export async function fetchMergedByProgram<T>(
  programSlugs: string[],
  fetcher: (programSlug: string) => Promise<T[]>
): Promise<T[]> {
  const results = await Promise.all(programSlugs.map(fetcher));
  return results.flat();
}
