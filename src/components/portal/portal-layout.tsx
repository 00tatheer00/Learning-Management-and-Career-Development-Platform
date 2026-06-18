import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { PortalShell } from "@/components/portal/portal-shell";
import type { UserRole } from "@/types/portal";

export async function PortalLayout({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowedRoles.includes(user.role)) {
    redirect(`/${user.role}/dashboard`);
  }
  return <PortalShell user={user}>{children}</PortalShell>;
}
