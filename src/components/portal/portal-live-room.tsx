"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RoomEvent } from "livekit-client";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { HandWaving, SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LiveRoomRole } from "@/lib/livekit/config";

interface PortalLiveRoomProps {
  sessionId: string;
  sessionTitle: string;
  role: LiveRoomRole;
  backHref: string;
}

export function PortalLiveRoom(props: PortalLiveRoomProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadToken = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/live/${props.sessionId}/token`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message ?? json.error ?? "Could not join class");
        return;
      }
      setToken(json.data.token);
      setServerUrl(json.data.url);
    } catch {
      setError("Could not connect to class room");
    } finally {
      setLoading(false);
    }
  }, [props.sessionId]);

  useEffect(() => {
    void loadToken();
  }, [loadToken]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        Connecting to class…
      </div>
    );
  }

  if (error || !token || !serverUrl) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-background p-6 text-center space-y-4">
        <p className="text-red-600 font-semibold">{error || "Unable to join"}</p>
        <Button asChild variant="secondary">
          <Link href={props.backHref}>Go back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)]">
      <div className="shrink-0 flex items-center justify-between gap-3 border-b border-border px-1 py-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Live Class</p>
          <h1 className="text-lg font-bold truncate">{props.sessionTitle}</h1>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href={props.backHref}>
            <SignOut size={16} /> Leave
          </Link>
        </Button>
      </div>

      <div className="flex-1 min-h-0 relative">
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect
          video
          audio
          data-lk-theme="default"
          style={{ height: "100%" }}
        >
          <LiveRoomInner sessionId={props.sessionId} role={props.role} />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}

function LiveRoomInner({
  sessionId,
  role,
}: {
  sessionId: string;
  role: LiveRoomRole;
}) {
  const isHost = role === "host" || role === "admin";

  return (
    <div className="h-full flex flex-col lg:flex-row">
      <div className="flex-1 min-h-0">
        {isHost ? <VideoConference /> : <StudentAdmissionGate />}
      </div>
      <div className="shrink-0 lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-background p-3 space-y-3 overflow-auto max-h-48 lg:max-h-none">
        {isHost && <HostWaitingPanel sessionId={sessionId} />}
        <HandRaisePanel isHost={isHost} />
        <RecordingNotice isHost={isHost} />
      </div>
    </div>
  );
}

function StudentAdmissionGate() {
  const room = useRoomContext();
  const [admitted, setAdmitted] = useState(false);

  const syncAdmission = useCallback(() => {
    const perms = room.localParticipant.permissions;
    setAdmitted(Boolean(perms?.canPublish && perms?.canSubscribe));
  }, [room.localParticipant.permissions]);

  useEffect(() => {
    syncAdmission();
    room.on(RoomEvent.ParticipantPermissionsChanged, syncAdmission);
    room.on(RoomEvent.Connected, syncAdmission);
    return () => {
      room.off(RoomEvent.ParticipantPermissionsChanged, syncAdmission);
      room.off(RoomEvent.Connected, syncAdmission);
    };
  }, [room, syncAdmission]);

  if (!admitted) {
    return <StudentWaitingView />;
  }

  return <VideoConference />;
}

function StudentWaitingView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <h2 className="text-xl font-bold">Waiting for trainer</h2>
      <p className="text-sm text-muted max-w-sm">
        You are in the waiting room. The trainer will admit you when class starts.
      </p>
    </div>
  );
}

function HostWaitingPanel({ sessionId }: { sessionId: string }) {
  const participants = useParticipants();
  const waiting = useMemo(
    () =>
      participants.filter(
        (p) => !p.isLocal && p.permissions && p.permissions.canPublish === false
      ),
    [participants]
  );

  const admit = async (participantId: string) => {
    await fetch(`/api/live/${sessionId}/admit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId }),
    });
  };

  if (waiting.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted">
        Waiting room empty
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
        Waiting ({waiting.length})
      </p>
      {waiting.map((participant) => (
        <div
          key={participant.identity}
          className="flex items-center justify-between gap-2 text-sm"
        >
          <span className="truncate font-medium">{participant.name ?? participant.identity}</span>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs shrink-0"
            onClick={() => void admit(participant.identity)}
          >
            Admit
          </Button>
        </div>
      ))}
    </div>
  );
}

function HandRaisePanel({ isHost }: { isHost: boolean }) {
  const room = useRoomContext();
  const participants = useParticipants();
  const [raised, setRaised] = useState(false);
  const [signals, setSignals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!room) return;

    const onData = (payload: Uint8Array, participant?: { identity: string }) => {
      try {
        const message = JSON.parse(new TextDecoder().decode(payload)) as {
          type?: string;
          raised?: boolean;
        };
        if (message.type === "hand_raise" && participant?.identity) {
          setSignals((current) => ({
            ...current,
            [participant.identity]: Boolean(message.raised),
          }));
        }
      } catch {
        // ignore malformed packets
      }
    };

    room.on("dataReceived", onData);
    return () => {
      room.off("dataReceived", onData);
    };
  }, [room]);

  const toggleHand = async () => {
    if (!room) return;
    const next = !raised;
    setRaised(next);
    const payload = new TextEncoder().encode(
      JSON.stringify({ type: "hand_raise", raised: next })
    );
    await room.localParticipant.publishData(payload, { reliable: true });
  };

  const raisedList = participants.filter(
    (p) => !p.isLocal && signals[p.identity]
  );

  return (
    <div className="rounded-xl border border-border p-3 space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">Raise hand</p>
      {!isHost && (
        <Button
          type="button"
          variant={raised ? "default" : "secondary"}
          size="sm"
          className="w-full gap-2"
          onClick={() => void toggleHand()}
        >
          <HandWaving size={16} weight="duotone" />
          {raised ? "Hand raised" : "Raise hand"}
        </Button>
      )}
      {isHost && (
        <div className="space-y-1">
          {raisedList.length === 0 ? (
            <p className="text-xs text-muted">No raised hands</p>
          ) : (
            raisedList.map((p) => (
              <p
                key={p.identity}
                className={cn(
                  "text-sm font-medium rounded-lg px-2 py-1 bg-orange-50 text-orange-900"
                )}
              >
                ✋ {p.name ?? p.identity}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function RecordingNotice({ isHost }: { isHost: boolean }) {
  if (!isHost) return null;

  return (
    <div className="rounded-xl border border-border bg-zinc-50 p-3 text-xs text-muted">
      <p className="font-semibold text-foreground mb-1">Recording</p>
      <p>
        Cloud recording needs LiveKit Egress + storage setup. Ask admin to enable when ready.
      </p>
    </div>
  );
}
