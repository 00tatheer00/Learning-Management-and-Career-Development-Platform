export const DEMO_PORTAL_STUDENT_EMAIL = "student@eest.com";

export function isDemoPortalStudent(email?: string | null): boolean {
  return email?.trim().toLowerCase() === DEMO_PORTAL_STUDENT_EMAIL;
}
