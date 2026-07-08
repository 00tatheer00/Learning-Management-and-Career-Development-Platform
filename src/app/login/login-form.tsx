"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPortalHome } from "@/lib/auth/portal-routes";
import {
  GraduationCap,
  ChalkboardTeacher,
  ShieldCheck,
  SignIn,
  Eye,
  EyeSlash,
  House,
  UserPlus,
} from "@phosphor-icons/react";
import { SiteLogo } from "@/components/shared/site-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/lib/ui/toast";
import { resetWhatsAppGroupPromptForLogin } from "@/components/portal/student-portal-welcome";
import { SITE_CONFIG } from "@/lib/constants";
import type { UserRole } from "@/types/portal";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";
import "./login-page.css";

const ROLES: {
  role: UserRole;
  label: string;
  icon: typeof GraduationCap;
  hint: string;
}[] = [
  {
    role: "student",
    label: "Student",
    icon: GraduationCap,
    hint: "Access your course, classes & assignments",
  },
  {
    role: "trainer",
    label: "Trainer",
    icon: ChalkboardTeacher,
    hint: "Manage students, classes & homework",
  },
  {
    role: "admin",
    label: "Admin",
    icon: ShieldCheck,
    hint: "Approve registrations & manage portal",
  },
];

export default function LoginForm({
  sessionNotice,
}: {
  sessionNotice?: "replaced";
}) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isStudent = selectedRole === "student";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        const message =
          result.status === 500
            ? isStudent
              ? STUDENT_UR.toasts.serverError
              : "Server error. Check Vercel env vars (NEXTAUTH_URL, DATABASE_URL)."
            : isStudent
              ? STUDENT_UR.toasts.wrongCredentials
              : "Wrong email or password. Try again.";
        setError(message);
        return;
      }

      const session = await getSession();
      const role = session?.user?.role ?? selectedRole;

      if (isStudent) {
        const isFirstLogin = Boolean(session?.isFirstLogin);
        toast.success(
          isFirstLogin ? STUDENT_UR.toasts.firstLogin : STUDENT_UR.toasts.welcomeBack,
          STUDENT_UR.toasts.redirecting
        );
        resetWhatsAppGroupPromptForLogin();
      } else {
        toast.success("Welcome back!", "Redirecting to your portal...");
      }

      router.push(getPortalHome(role));
      router.refresh();
    } catch {
      const message = isStudent
        ? STUDENT_UR.toasts.networkError
        : "Something went wrong. Check your internet and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="main-content" className="login-page">
      <aside className="login-hero" aria-hidden="false">
        <div className="login-hero-inner">
          <SiteLogo variant="login" href="/" onDark className="!h-12 sm:!h-14" />

          <div className="login-hero-copy">
            <h1>Hey, Hello!</h1>
            <h2>Welcome to {SITE_CONFIG.shortName}</h2>
            <p>
              Sign in to your portal for live classes, course materials, assignments, and progress —
              all in one premium learning experience.
            </p>
          </div>
        </div>
      </aside>

      <main className="login-panel">
        <div className="login-card">
          <div className="lg:hidden flex justify-center mb-6">
            <SiteLogo variant="login" href="/" className="!h-12" />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-zinc-500 mt-1.5">
              {ROLES.find((r) => r.role === selectedRole)?.hint}
            </p>
          </div>

          <div
            className="grid grid-cols-3 gap-2 mb-6"
            role="tablist"
            aria-label="Portal role"
          >
            {ROLES.map(({ role, label, icon: Icon }) => (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={selectedRole === role}
                data-active={selectedRole === role}
                onClick={() => setSelectedRole(role)}
                className="login-role-tab flex flex-col items-center gap-1.5 p-2.5 sm:p-3 text-center"
              >
                <Icon size={22} weight="duotone" />
                <span className="text-[11px] sm:text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>

          {sessionNotice === "replaced" && isStudent && (
            <Alert variant="warning" title={STUDENT_UR.alerts.sessionReplacedTitle} className="mb-5">
              {STUDENT_UR.alerts.sessionReplaced}
            </Alert>
          )}

          {sessionNotice === "replaced" && !isStudent && (
            <Alert variant="warning" title="Logged out from this device" className="mb-5">
              This account was opened on another phone or computer. For security, only one device
              can stay logged in at a time. Sign in again if this is your device.
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {isStudent && (
              <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                {STUDENT_UR.alerts.oneDevice}
              </p>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="login-field mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="login-field pr-11"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-zinc-500 font-medium hover:text-[#8a6d28] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium text-center bg-red-50 rounded-lg p-3 border border-red-100">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className={cn("login-submit w-full", loading && "opacity-80")}
              disabled={loading}
            >
              <SignIn size={18} weight="bold" />
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="login-divider">OR</div>

            <Link href="/register" className="login-alt-link">
              <UserPlus size={18} weight="duotone" />
              Create new account
            </Link>

            <Link href="/" className="login-alt-link">
              <House size={18} weight="duotone" />
              Back to website
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-zinc-900 hover:text-[#8a6d28]">
              Sign Up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
