import type { UserRole } from "@/types/portal";

export function getPortalHome(role: UserRole): string {
  switch (role) {
    case "admin":
    case "admin_readonly":
      return "/admin/dashboard";
    case "trainer":
      return "/trainer/dashboard";
    default:
      return "/student/dashboard";
  }
}
