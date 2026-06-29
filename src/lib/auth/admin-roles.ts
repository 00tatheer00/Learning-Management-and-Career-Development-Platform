import type { UserRole } from "@/types/portal";

export function isAdminRole(role: UserRole): boolean {
  return role === "admin" || role === "admin_readonly";
}

export function canAdminWrite(role: UserRole): boolean {
  return role === "admin";
}
