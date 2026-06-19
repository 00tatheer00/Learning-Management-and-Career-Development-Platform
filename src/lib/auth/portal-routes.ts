import type { UserRole } from "@/types/portal";

export function getPortalHome(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "trainer":
      return "/trainer/dashboard";
    default:
      return "/student/dashboard";
  }
}
