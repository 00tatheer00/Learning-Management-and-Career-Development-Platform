import type { UserRole } from "@/types/portal";

export function isAdminRole(role: UserRole): boolean {
  return role === "admin" || role === "admin_readonly";
}

/** Edit students, credentials, trainers, delete registrations, etc. */
export function canAdminWrite(role: UserRole): boolean {
  return role === "admin" || role === "admin_readonly";
}

/** Approve or reject new registrations — super admin only. */
export function canAdminApproveReject(role: UserRole): boolean {
  return role === "admin";
}
