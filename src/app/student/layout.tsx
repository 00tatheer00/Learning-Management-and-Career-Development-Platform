import { PortalLayout } from "@/components/portal/portal-layout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout allowedRoles={["student"]}>{children}</PortalLayout>;
}
