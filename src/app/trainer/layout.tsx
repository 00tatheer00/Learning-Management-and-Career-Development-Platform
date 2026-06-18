import { PortalLayout } from "@/components/portal/portal-layout";

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout allowedRoles={["trainer"]}>{children}</PortalLayout>;
}
