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

const SEEN_IDS_KEY = "eest-admin-seen-pending-ids";
const POLL_MS = 30_000;

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
        toast.info(
          "New registration",
          `${item.fullName} applied for ${item.courseTitle}`
        );
      }
    }

    knownIdsRef.current = new Set(items.map((item) => item.id));
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      const json = await res.json();
      if (!json.success || !json.data) return;
      applyAlerts(json.data.pending ?? [], json.data.pendingCount ?? 0);
    } catch {
      // ignore polling errors
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
    void fetchAlerts();
    const timer = window.setInterval(() => void fetchAlerts(), POLL_MS);
    return () => window.clearInterval(timer);
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
