import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { PortalShell } from "@/components/portal/portal-shell";
import type { UserRole } from "@/types/portal";

export async function PortalLayout({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const session = await getServerSession(authOptions);
  if (session?.sessionInvalid) {
    redirect("/login?reason=session-replaced");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowedRoles.includes(user.role)) {
    redirect(`/${user.role}/dashboard`);
  }
  if (user.role === "admin") {
    return <AdminPortalShell user={user}>{children}</AdminPortalShell>;
  }
  return <PortalShell user={user}>{children}</PortalShell>;
}
