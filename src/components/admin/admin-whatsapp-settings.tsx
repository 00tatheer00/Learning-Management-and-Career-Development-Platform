"use client";

import { useEffect, useState } from "react";
import { ChatsCircle, ArrowSquareOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/ui/toast";
import { useAdminPermissions } from "@/components/admin/admin-permissions";

interface WhatsAppStatus {
  configured: boolean;
  connected: boolean;
  status?: string;
  error?: string;
}

export function AdminWhatsAppSettings() {
  const { canWrite } = useAdminPermissions();
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

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
        body: JSON.stringify({ action: "test" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Test sent");
        if (json.data?.status) setStatus(json.data.status);
      } else {
        toast.error("WhatsApp test failed", json.message ?? json.error ?? "Unknown error");
        void loadStatus();
      }
    } catch {
      toast.error("WhatsApp test failed");
    } finally {
      setTesting(false);
    }
  };

  const instanceId = "instance181496";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        status?.connected
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <ChatsCircle size={24} weight="duotone" className="text-emerald-600" />
        <h2 className="font-bold">WhatsApp (UltraMsg)</h2>
      </div>

      <p className="text-sm leading-relaxed">
        <strong>Live server status:</strong>{" "}
        {loading
          ? "Checking..."
          : status?.connected
            ? "Connected — messages will send"
            : status?.configured
              ? `Not connected (${status.status ?? "unknown"})`
              : "Not configured on Vercel (missing env vars)"}
      </p>

      {!loading && status && !status.connected && (
        <p className="mt-2 text-sm leading-relaxed">
          {status.error ??
            "Open UltraMsg dashboard → scan QR with your WhatsApp. Session expires every few weeks."}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="gap-2" asChild>
          <a
            href={`https://user.ultramsg.com/${instanceId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowSquareOut size={18} />
            Open UltraMsg Dashboard
          </a>
        </Button>
        {canWrite && (
          <Button type="button" className="gap-2" disabled={testing} onClick={() => void sendTest()}>
            <ChatsCircle size={18} weight="duotone" />
            {testing ? "Sending..." : "Send Test Message"}
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={() => void loadStatus()}>
          Refresh Status
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted">
        Vercel env: <code className="bg-surface px-1 rounded">ULTRAMSG_INSTANCE_ID</code> +{" "}
        <code className="bg-surface px-1 rounded">ULTRAMSG_TOKEN</code>. If test fails here, QR
        scan karein ya env vars check karein.
      </p>
    </div>
  );
}
