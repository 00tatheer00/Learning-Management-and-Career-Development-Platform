import type { Metadata } from "next";
import { PortalLayout } from "@/components/portal/portal-layout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout allowedRoles={["student"]}>{children}</PortalLayout>;
}
