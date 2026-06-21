"use client";

import { AdminAlertsProvider } from "@/components/admin/admin-alerts-provider";
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
    <AdminAlertsProvider>
      <PortalShell user={user}>{children}</PortalShell>
    </AdminAlertsProvider>
  );
}
