"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { VideoCamera, CheckCircle } from "@phosphor-icons/react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LiveClassRow {
  id: string;
  title: string;
  date: string;
  time: string;
  programSlug: string;
  courseTitle: string;
  trainerName: string;
  roomType: "portal" | "meet";
  meetLink: string;
}

export default function AdminLiveClassesPage() {
  const [rows, setRows] = useState<LiveClassRow[]>([]);
  const [jitsiDomain, setJitsiDomain] = useState("meet.jit.si");
  const [portalCount, setPortalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/live-classes", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setRows(json.data?.rows ?? []);
        setJitsiDomain(json.data?.jitsiDomain ?? "meet.jit.si");
        setPortalCount(json.data?.portalCount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <PortalPageHeader
        title="Portal Live Classes"
        description="100% free in-portal video (Jitsi). No API keys. Vercel sirf page serve karta hai — video alag server par."
      />

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
        <CheckCircle size={24} className="text-emerald-600 shrink-0" weight="fill" />
        <div className="text-sm space-y-2">
          <p className="font-bold text-foreground">Free — koi LiveKit / paid plan nahi</p>
          <p className="text-muted">
            Server: <strong>{jitsiDomain}</strong> · {portalCount} portal class(es). Mic, camera,
            screen share, chat, raise hand — sab built-in.
          </p>
          <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <strong>150 students:</strong> public meet.jit.si par limit ho sakti hai. Bari batch ke
            liye baad mein Oracle free VPS par apna Jitsi (still $0) — env{" "}
            <code className="text-[11px]">JITSI_DOMAIN</code> set karo.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Class</th>
                <th className="px-4 py-3 text-left font-semibold">Course</th>
                <th className="px-4 py-3 text-left font-semibold">Schedule</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No classes yet
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.title}</p>
                      <p className="text-xs text-muted">{row.trainerName}</p>
                    </td>
                    <td className="px-4 py-3">{row.courseTitle}</td>
                    <td className="px-4 py-3 text-muted">
                      {row.date} · {row.time}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          row.roomType === "portal"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-zinc-100 text-zinc-700"
                        )}
                      >
                        {row.roomType === "portal" ? "Portal (free)" : "External link"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.roomType === "portal" ? (
                        <Button size="sm" asChild>
                          <Link href={`/admin/live-classes/${row.id}/live`}>
                            <VideoCamera size={16} /> Join
                          </Link>
                        </Button>
                      ) : row.meetLink ? (
                        <a
                          href={row.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-xs font-semibold underline"
                        >
                          External link
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
