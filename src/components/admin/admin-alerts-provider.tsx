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
import { playPortalSound } from "@/lib/ui/portal-sounds";
import {
  notifyAdminNewRegistration,
  requestBrowserNotificationPermission,
} from "@/lib/ui/browser-notifications";

const SEEN_IDS_KEY = "eest-admin-seen-pending-ids";

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

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.data) {
        applyAlerts(data.data.pending ?? [], data.data.pendingCount ?? 0);
      }
    } catch {
      // ignore network errors
    }
  }, [applyAlerts]);

  const markAllSeen = useCallback(() => {
    const seenIds = readSeenIds();
    for (const item of pendingRef.current) {
      seenIds.add(item.id);
    }
    writeSeenIds(seenIds);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    void requestBrowserNotificationPermission();
    void fetchAlerts();

    let lastFetch = Date.now();
    const pollInterval = 60_000;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        lastFetch = Date.now();
        void fetchAlerts();
      }
    }, pollInterval);

    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetch >= 20_000) {
        lastFetch = Date.now();
        void fetchAlerts();
      }
    };

    document.addEventListener("visibilitychange", onFocusOrVisible);
    window.addEventListener("focus", onFocusOrVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
      window.removeEventListener("focus", onFocusOrVisible);
    };
  }, [fetchAlerts]);

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
