"use client";

import { createContext, useContext } from "react";
import { canAdminWrite, isAdminRole } from "@/lib/auth/admin-roles";
import type { UserRole } from "@/types/portal";

interface AdminPermissions {
  canWrite: boolean;
  isReadOnly: boolean;
}

const AdminPermissionsContext = createContext<AdminPermissions>({
  canWrite: false,
  isReadOnly: false,
});

export function AdminPermissionsProvider({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const canWrite = canAdminWrite(role);
  const isReadOnly = isAdminRole(role) && !canWrite;

  return (
    <AdminPermissionsContext.Provider value={{ canWrite, isReadOnly }}>
      {children}
    </AdminPermissionsContext.Provider>
  );
}

export function useAdminPermissions() {
  return useContext(AdminPermissionsContext);
}

export function AdminReadOnlyBanner() {
  const { isReadOnly } = useAdminPermissions();
  if (!isReadOnly) return null;

  return (
    <div className="portal-readonly-banner mb-4 rounded-xl border px-4 py-3 text-sm">
      <strong>View only.</strong> Aap admin portal dekh sakti hain — approve, edit ya delete nahi kar
      sakti. <strong>Students</strong> page se Web / App alag CSV download kar ke WhatsApp groups bana
      sakti hain. Changes ke liye Tatheer se rabta karein.
    </div>
  );
}
