import { redirect } from "next/navigation";
import { getCurrentUser, getPortalHome } from "@/lib/auth/session";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(getPortalHome(user.role));
  const { reason } = await searchParams;
  return <LoginForm sessionNotice={reason === "session-replaced" ? "replaced" : undefined} />;
}
