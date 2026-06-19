"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, EnvelopeSimple } from "@phosphor-icons/react";
import { SiteLogo } from "@/components/shared/site-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/lib/ui/toast";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Could not send reset link");
        return;
      }

      setSent(true);
      toast.success("Check your email and WhatsApp", "Reset instructions sent if account exists.");
    } catch {
      toast.error("Something went wrong", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface via-background to-orange-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SiteLogo variant="login" href="/" />
          </div>
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted mt-2 text-sm">
            Enter your portal email. We will send a reset link by email and WhatsApp.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background shadow-xl p-6 sm:p-8">
          {sent ? (
            <Alert variant="success" title="Instructions sent">
              If an account exists for <strong>{email}</strong>, check your email and WhatsApp
              for a password reset link valid for 1 hour.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">Portal Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  className="mt-2 h-12"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
                <EnvelopeSimple size={18} weight="duotone" />
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

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
