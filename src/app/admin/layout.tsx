import { PortalLayout } from "@/components/portal/portal-layout";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout allowedRoles={["admin", "admin_readonly"]}>{children}</PortalLayout>;
}
