"use client";

import { useEffect, useState } from "react";
import { ChatsCircle, ArrowSquareOut, Copy, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";
import { useAdminPermissions } from "@/components/admin/admin-permissions";

interface WhatsAppStatus {
  configured: boolean;
  connected: boolean;
  webhookUrl: string;
  phoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  error?: string;
}

export function AdminWhatsAppSettings() {
  const { canWrite } = useAdminPermissions();
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState("");

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setStatus(json.data);
      }
    } catch {
      toast.error("Could not load WhatsApp status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const sendTest = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          phone: testPhone.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.whatsapp(json.message ?? "Test template sent ✓", "Check the phone for Hello World");
        if (json.data?.status) setStatus(json.data.status);
      } else {
        toast.error("WhatsApp test failed", json.message ?? json.error ?? "Unknown error");
        if (json.data?.status) setStatus(json.data.status);
        else void loadStatus();
      }
    } catch {
      toast.error("WhatsApp test failed");
    } finally {
      setTesting(false);
    }
  };

  const copyWebhook = async () => {
    if (!status?.webhookUrl) return;
    try {
      await navigator.clipboard.writeText(status.webhookUrl);
      toast.success("Webhook URL copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        status?.connected ? "portal-callout-emerald" : "portal-callout-error"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <ChatsCircle size={24} weight="duotone" className="text-emerald-600" />
        <h2 className="font-bold">WhatsApp (Meta Cloud API)</h2>
      </div>

      <p className="text-sm leading-relaxed">
        <strong>Status:</strong>{" "}
        {loading
          ? "Checking..."
          : status?.connected
            ? "Connected — messages will send"
            : status?.configured
              ? `Not connected${status.error ? ` — ${status.error}` : ""}`
              : "Not configured on server (missing env vars)"}
      </p>

      {status?.connected && (
        <div className="mt-2 text-sm space-y-1">
          {status.phoneNumber && (
            <p>
              <CheckCircle size={14} className="inline mr-1 text-emerald-600" />
              Number: <strong>{status.phoneNumber}</strong>
              {status.verifiedName ? ` (${status.verifiedName})` : ""}
            </p>
          )}
          {status.qualityRating && (
            <p className="text-muted">Quality: {status.qualityRating}</p>
          )}
        </div>
      )}

      {status?.webhookUrl && (
        <div className="mt-3 rounded-xl border border-border/60 bg-background/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
            Webhook URL (Meta Developer Console)
          </p>
          <code className="text-xs break-all">{status.webhookUrl}</code>
          <div className="mt-2">
            <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={() => void copyWebhook()}>
              <Copy size={14} />
              Copy webhook URL
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 items-end">
        <Button type="button" variant="secondary" className="gap-2" asChild>
          <a
            href="https://developers.facebook.com/apps/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowSquareOut size={18} />
            Meta Developer Console
          </a>
        </Button>
        {canWrite && (
          <>
            <Input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="03XXXXXXXXX (optional)"
              className="max-w-[180px]"
            />
            <Button type="button" className="gap-2" disabled={testing} onClick={() => void sendTest()}>
              <ChatsCircle size={18} weight="duotone" />
              {testing ? "Sending..." : "Send Test"}
            </Button>
          </>
        )}
        <Button type="button" variant="secondary" onClick={() => void loadStatus()}>
          Refresh Status
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted">
        Vercel env:{" "}
        <code className="bg-surface px-1 rounded">WHATSAPP_ACCESS_TOKEN</code>,{" "}
        <code className="bg-surface px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code>,{" "}
        <code className="bg-surface px-1 rounded">WHATSAPP_WEBHOOK_VERIFY_TOKEN</code>,{" "}
        <code className="bg-surface px-1 rounded">WHATSAPP_APP_SECRET</code>. See{" "}
        <code className="bg-surface px-1 rounded">DEPLOYMENT.md</code> for setup steps.
      </p>

      <p className="mt-2 text-xs text-muted leading-relaxed">
        <strong>No message on phone?</strong> Meta dev mode only delivers to{" "}
        <strong>test recipient numbers</strong> you add in Meta → WhatsApp → API Setup. Test uses
        the official <code className="bg-surface px-1 rounded">hello_world</code> template. Or first
        send a WhatsApp message <em>to</em> your business number (+92 321 5919502), then free-text
        replies work for 24 hours.
      </p>
    </div>
  );
}
