"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Key } from "@phosphor-icons/react";
import { SiteLogo } from "@/components/shared/site-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/lib/ui/toast";

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password too short", "Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Could not reset password");
        return;
      }

      toast.success("Password updated", "You can sign in with your new password.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Alert variant="error" title="Invalid link">
        This reset link is missing or invalid.{" "}
        <Link href="/forgot-password" className="font-semibold underline">
          Request a new one
        </Link>
        .
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-12"
          minLength={8}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mt-2 h-12"
          minLength={8}
          required
        />
      </div>
      <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
        <Key size={18} weight="duotone" />
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface via-background to-orange-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SiteLogo variant="login" href="/" />
          </div>
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-muted mt-2 text-sm">Choose a strong password for your portal account.</p>
        </div>

        <div className="rounded-2xl border border-border bg-background shadow-xl p-6 sm:p-8">
          <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
            <ResetPasswordFormInner />
          </Suspense>

          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
