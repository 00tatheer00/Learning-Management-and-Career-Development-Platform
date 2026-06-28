"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { LiveRoomRole } from "@/lib/portal-video/config";

interface PortalLiveRoomProps {
  sessionId: string;
  sessionTitle: string;
  role: LiveRoomRole;
  backHref: string;
}

interface JoinPayload {
  domain: string;
  roomName: string;
  displayName: string;
  password?: string;
  role: LiveRoomRole;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: Record<string, unknown>
    ) => { dispose: () => void };
  }
}

export function PortalLiveRoom(props: PortalLiveRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiRef = useRef<{ dispose: () => void } | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [joinData, setJoinData] = useState<JoinPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadJoin() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/live/${props.sessionId}/join`, { method: "POST" });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) {
          setError(json.message ?? json.error ?? "Could not join class");
          return;
        }
        setJoinData(json.data as JoinPayload);
      } catch {
        if (!cancelled) setError("Could not connect to class room");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadJoin();
    return () => {
      cancelled = true;
    };
  }, [props.sessionId]);

  useEffect(() => {
    if (!scriptReady || !joinData || !containerRef.current || !window.JitsiMeetExternalAPI) {
      return;
    }

    jitsiRef.current?.dispose();
    containerRef.current.innerHTML = "";

    const isHost = joinData.role === "host" || joinData.role === "admin";

    const api = new window.JitsiMeetExternalAPI(joinData.domain, {
      roomName: joinData.roomName,
      parentNode: containerRef.current,
      userInfo: { displayName: joinData.displayName },
      ...(joinData.password ? { roomPassword: joinData.password } : {}),
      width: "100%",
      height: "100%",
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: !isHost,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        enableLobbyChat: true,
        enableInsecureRoomNameWarning: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "desktop",
          "chat",
          "raisehand",
          "tileview",
          "fullscreen",
          "hangup",
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
    });

    jitsiRef.current = api;

    return () => {
      api.dispose();
      jitsiRef.current = null;
    };
  }, [scriptReady, joinData]);

  return (
    <>
      <Script
        src={`https://${joinData?.domain ?? "meet.jit.si"}/external_api.js`}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      <div className="flex flex-col h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)]">
        <div className="shrink-0 flex items-center justify-between gap-3 border-b border-border px-1 py-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Live Class · Free in-portal video
            </p>
            <h1 className="text-lg font-bold truncate">{props.sessionTitle}</h1>
            {(props.role === "host" || props.role === "admin") && (
              <p className="text-[11px] text-muted mt-0.5">
                Join first as host — students use waiting lobby if enabled on server.
              </p>
            )}
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href={props.backHref}>
              <SignOut size={16} /> Leave
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-muted">Connecting…</div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-md text-center space-y-4">
              <p className="text-red-600 font-semibold">{error}</p>
              <Button asChild variant="secondary">
                <Link href={props.backHref}>Go back</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="flex-1 min-h-0 rounded-xl overflow-hidden bg-zinc-900" />
        )}
      </div>
    </>
  );
}
