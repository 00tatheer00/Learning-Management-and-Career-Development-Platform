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
