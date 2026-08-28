import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getPortalHome } from "@/lib/auth/session";
import { createMetadata } from "@/lib/seo/metadata";
import LoginForm from "./login-form";

export const metadata: Metadata = createMetadata({
  title: "Portal Login | Student & Trainer Portal",
  description: "Sign in to access your student, trainer, or administrative portal at Emerging Edge School of Technology.",
  path: "/login",
  noIndex: true,
});

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
