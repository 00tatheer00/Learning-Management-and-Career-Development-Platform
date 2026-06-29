"use client";

import { AdminAlertsProvider } from "@/components/admin/admin-alerts-provider";
import { AdminReadOnlyBanner, AdminPermissionsProvider } from "@/components/admin/admin-permissions";
import { AdminRevenueProvider } from "@/components/admin/admin-revenue-side-panel";
import { AdminStudentProfileProvider } from "@/components/admin/admin-student-profile-drawer";
import { PortalShell } from "@/components/portal/portal-shell";
import type { PortalUser } from "@/types/portal";

export function AdminPortalShell({
  user,
  children,
}: {
  user: PortalUser;
  children: React.ReactNode;
}) {
  return (
    <AdminPermissionsProvider role={user.role}>
      <AdminAlertsProvider>
        <AdminRevenueProvider>
          <AdminStudentProfileProvider>
            <PortalShell user={user}>
              <AdminReadOnlyBanner />
              {children}
            </PortalShell>
          </AdminStudentProfileProvider>
        </AdminRevenueProvider>
      </AdminAlertsProvider>
    </AdminPermissionsProvider>
  );
}
