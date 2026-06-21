"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { toast } from "@/lib/ui/toast";
import { playPortalSound, primePortalSounds } from "@/lib/ui/portal-sounds";
import {
  notifyAdminNewRegistration,
  requestBrowserNotificationPermission,
} from "@/lib/ui/browser-notifications";

const SEEN_IDS_KEY = "eest-admin-seen-pending-ids";
const SSE_RECONNECT_MS = 1_500;

interface PendingAlert {
  id: string;
  fullName: string;
  courseTitle: string;
  program: string;
  level: string;
  createdAt: string;
}

interface AdminAlertsContextValue {
  pendingCount: number;
  pending: PendingAlert[];
  unreadCount: number;
  markAllSeen: () => void;
}

const AdminAlertsContext = createContext<AdminAlertsContextValue | null>(null);

function readSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSeenIds(ids: Set<string>) {
  try {
    localStorage.setItem(SEEN_IDS_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore storage errors
  }
}

export function AdminAlertsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [pending, setPending] = useState<PendingAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const pendingRef = useRef<PendingAlert[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  const applyAlerts = useCallback((items: PendingAlert[], total: number) => {
    pendingRef.current = items;
    setPendingCount(total);
    setPending(items);

    const seenIds = readSeenIds();
    const unread = items.filter((item) => !seenIds.has(item.id)).length;
    setUnreadCount(unread);

    if (!initializedRef.current) {
      initializedRef.current = true;
      knownIdsRef.current = new Set(items.map((item) => item.id));
      return;
    }

    for (const item of items) {
      if (!knownIdsRef.current.has(item.id) && !seenIds.has(item.id)) {
        playPortalSound("adminNewRegistration");
        toast.info("New registration", `${item.fullName} applied for ${item.courseTitle}`);
        if (document.hidden) {
          notifyAdminNewRegistration(item.fullName, item.courseTitle);
        }
      }
    }

    knownIdsRef.current = new Set(items.map((item) => item.id));
  }, []);

  const handleStreamPayload = useCallback(
    (payload: {
      type: string;
      pendingCount?: number;
      pending?: PendingAlert[];
    }) => {
      if (payload.type !== "update") return;
      applyAlerts(payload.pending ?? [], payload.pendingCount ?? 0);
    },
    [applyAlerts]
  );

  const connectStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const source = new EventSource("/api/admin/notifications/stream");
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as {
          type: string;
          pendingCount?: number;
          pending?: PendingAlert[];
        };
        handleStreamPayload(payload);
      } catch {
        // ignore malformed events
      }
    };

    source.onerror = () => {
      source.close();
      eventSourceRef.current = null;
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = window.setTimeout(connectStream, SSE_RECONNECT_MS);
    };
  }, [handleStreamPayload]);

  const markAllSeen = useCallback(() => {
    const seenIds = readSeenIds();
    for (const item of pendingRef.current) {
      seenIds.add(item.id);
    }
    writeSeenIds(seenIds);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    primePortalSounds();
    void requestBrowserNotificationPermission();
    connectStream();

    const onVisible = () => {
      if (document.visibilityState === "visible") connectStream();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [connectStream]);

  useEffect(() => {
    if (pathname.startsWith("/admin/enrollments")) {
      markAllSeen();
    }
  }, [pathname, markAllSeen]);

  return (
    <AdminAlertsContext.Provider
      value={{ pendingCount, pending, unreadCount, markAllSeen }}
    >
      {children}
    </AdminAlertsContext.Provider>
  );
}

export function useAdminAlerts() {
  const context = useContext(AdminAlertsContext);
  if (!context) {
    throw new Error("useAdminAlerts must be used within AdminAlertsProvider");
  }
  return context;
}

export function useAdminAlertsOptional() {
  return useContext(AdminAlertsContext);
}

export type { PendingAlert };
