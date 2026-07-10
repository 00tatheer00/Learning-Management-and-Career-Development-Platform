/** Primary demo / testing student login (Resend test emails). */
export const DEMO_PORTAL_STUDENT_EMAIL = "tatheerabidi00@gmail.com";

/** Legacy seed email — still treated as demo for portal access. */
export const LEGACY_DEMO_PORTAL_STUDENT_EMAIL = "student@eest.com";

export function isDemoPortalStudent(email?: string | null): boolean {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized === DEMO_PORTAL_STUDENT_EMAIL ||
    normalized === LEGACY_DEMO_PORTAL_STUDENT_EMAIL
  );
}

export function isDemoEnrollment(row: {
  email?: string | null;
  id?: string | null;
}): boolean {
  if (row.id?.startsWith("enrollment-demo-")) return true;
  return isDemoPortalStudent(row.email);
}

export function excludeDemoEnrollments<T extends { email?: string | null; id?: string | null }>(
  rows: T[]
): T[] {
  return rows.filter((row) => !isDemoEnrollment(row));
}
