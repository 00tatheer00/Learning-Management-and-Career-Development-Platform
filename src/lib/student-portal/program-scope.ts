import { prisma } from "@/lib/prisma";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import type { PortalUser } from "@/types/portal";

/** Demo student sees active scheduled programs in the portal. */
export const DEMO_STUDENT_PROGRAM_SLUGS = ["web-development", "app-development", "artificial-intelligence"] as const;

/**
 * Returns all distinct program slugs a student is approved for,
 * derived from their approved Enrollment records.
 */
export async function getApprovedProgramSlugs(email: string): Promise<string[]> {
  const rows = await prisma.enrollment.findMany({
    where: {
      status: "approved",
    },
    select: { program: true, email: true },
  });

  const normalizedEmail = email.trim().toLowerCase();
  const studentRows = rows.filter(
    (row) => row.email && row.email.trim().toLowerCase() === normalizedEmail
  );

  const slugs = [...new Set(studentRows.map((row) => row.program))];
  return slugs.length > 0 ? slugs : [];
}

/**
 * Returns all program slugs a student should see in their portal.
 * Derives from approved Enrollment records — supports multi-program access.
 *
 * If the PortalUser already has `programSlugs` populated (from session),
 * those are used directly to avoid redundant DB queries.
 */
export async function getStudentPortalProgramSlugs(
  user: Pick<PortalUser, "email" | "programSlug" | "programSlugs">
): Promise<string[]> {
  if (isDemoPortalStudent(user.email)) {
    return [...DEMO_STUDENT_PROGRAM_SLUGS];
  }

  // If programSlugs was already populated (e.g. from session), use it
  if (user.programSlugs && user.programSlugs.length > 0) {
    return user.programSlugs;
  }

  // Otherwise derive from approved enrollments
  const approvedSlugs = await getApprovedProgramSlugs(user.email);
  if (approvedSlugs.length > 0) {
    return approvedSlugs;
  }

  // Fallback: use the single programSlug on the User record
  return [user.programSlug ?? "web-development"];
}

export async function canStudentAccessProgram(
  user: Pick<PortalUser, "email" | "programSlug" | "programSlugs">,
  programSlug: string
): Promise<boolean> {
  const slugs = await getStudentPortalProgramSlugs(user);
  return slugs.includes(programSlug);
}

export async function fetchMergedByProgram<T>(
  programSlugs: string[],
  fetcher: (programSlug: string) => Promise<T[]>
): Promise<T[]> {
  const results = await Promise.all(programSlugs.map(fetcher));
  return results.flat();
}
