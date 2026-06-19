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
} from "@phosphor-icons/react";
import { SiteLogo } from "@/components/shared/site-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import type { UserRole } from "@/types/portal";

const ROLES: {
  role: UserRole;
  label: string;
  icon: typeof GraduationCap;
  hint: string;
  demo: string;
}[] = [
  {
    role: "student",
    label: "Student",
    icon: GraduationCap,
    hint: "Access your course, classes & assignments",
    demo: "student@eest.com / student123",
  },
  {
    role: "trainer",
    label: "Trainer",
    icon: ChalkboardTeacher,
    hint: "Manage students, classes & homework",
    demo: "tatheer@eest.com / tatheer@321",
  },
  {
    role: "admin",
    label: "Admin",
    icon: ShieldCheck,
    hint: "Approve registrations & manage portal",
    demo: "admin@eest.com / admin@321",
  },
];

export default function LoginForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    const demo = ROLES.find((r) => r.role === selectedRole)?.demo ?? "";
    const [demoEmail, demoPass] = demo.split(" / ");
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const message =
          result.status === 500
            ? "Server error. Check Vercel env vars (NEXTAUTH_URL, DATABASE_URL)."
            : "Wrong email or password. Try again.";
        setError(message);
        toast.error("Login failed", message);
        return;
      }

      toast.success("Welcome back!", "Redirecting to your portal...");

      const session = await getSession();
      const role = session?.user?.role ?? selectedRole;
      router.push(getPortalHome(role));
      router.refresh();
    } catch {
      const message = "Something went wrong. Check your internet and try again.";
      setError(message);
      toast.error("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface via-background to-orange-50">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SiteLogo variant="login" href="/" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Portal Login</h1>
          <p className="text-muted mt-2">Choose who you are, then sign in</p>
        </div>

        <div className="rounded-2xl border border-border bg-background shadow-xl p-6 sm:p-8">
          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLES.map(({ role, label, icon: Icon }) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 sm:p-4 transition-all text-center",
                  selectedRole === role
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/30 text-muted"
                )}
              >
                <Icon size={24} weight="duotone" />
                <span className="text-xs sm:text-sm font-semibold">{label}</span>
              </button>
            ))}
          </div>

          <p className="text-sm text-muted text-center mb-6">
            {ROLES.find((r) => r.role === selectedRole)?.hint}
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-2 h-12 text-base"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-base">
                Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-12 text-base pr-12"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium text-center bg-red-50 rounded-lg p-3">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-14 text-base font-bold" disabled={loading}>
              <SignIn size={20} weight="bold" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center space-y-3">
            <button
              type="button"
              onClick={fillDemo}
              className="text-sm text-primary font-medium hover:underline"
            >
              Use demo login for {selectedRole}
            </button>
            <p className="text-sm text-muted">
              Not registered yet?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </p>
            <Link href="/" className="text-sm text-muted hover:text-foreground block">
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
