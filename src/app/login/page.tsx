import { redirect } from "next/navigation";
import { getCurrentUser, getPortalHome } from "@/lib/auth/session";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(getPortalHome(user.role));
  return <LoginForm />;
}
