"use client";

import { createContext, useContext } from "react";
import { canAdminApproveReject, canAdminWrite, isAdminRole } from "@/lib/auth/admin-roles";
import type { UserRole } from "@/types/portal";

interface AdminPermissions {
  canWrite: boolean;
  canApproveReject: boolean;
  isLimitedAdmin: boolean;
}

const AdminPermissionsContext = createContext<AdminPermissions>({
  canWrite: false,
  canApproveReject: false,
  isLimitedAdmin: false,
});

export function AdminPermissionsProvider({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const canWrite = canAdminWrite(role);
  const canApproveReject = canAdminApproveReject(role);
  const isLimitedAdmin = role === "admin_readonly" && canWrite;

  return (
    <AdminPermissionsContext.Provider value={{ canWrite, canApproveReject, isLimitedAdmin }}>
      {children}
    </AdminPermissionsContext.Provider>
  );
}

export function useAdminPermissions() {
  return useContext(AdminPermissionsContext);
}

export function AdminReadOnlyBanner() {
  const { isLimitedAdmin } = useAdminPermissions();
  if (!isLimitedAdmin) return null;

  return (
    <div className="portal-readonly-banner mb-4 rounded-xl border px-4 py-3 text-sm">
      <strong>Approve / Reject:</strong> Only Tatheer can approve or reject registrations.
      You can handle everything else — students, portal logins, trainers, deletes, WhatsApp resend,
      exports, and settings.
    </div>
  );
}
