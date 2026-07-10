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
  notifyAdminWhatsAppMessage,
  requestBrowserNotificationPermission,
} from "@/lib/ui/browser-notifications";
import type { WhatsAppConversationRow } from "@/lib/api/whatsapp-crm";

const SSE_RECONNECT_MS = 1_500;

interface AdminWhatsAppInboxContextValue {
  totalUnread: number;
  conversations: WhatsAppConversationRow[];
  refreshConversations: () => Promise<void>;
}

const AdminWhatsAppInboxContext = createContext<AdminWhatsAppInboxContextValue | null>(null);

export function AdminWhatsAppInboxProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [totalUnread, setTotalUnread] = useState(0);
  const [conversations, setConversations] = useState<WhatsAppConversationRow[]>([]);
  const knownUnreadRef = useRef<Map<string, number>>(new Map());
  const initializedRef = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  const applySnapshot = useCallback(
    (items: WhatsAppConversationRow[], unread: number) => {
      setConversations(items);
      setTotalUnread(unread);

      if (!initializedRef.current) {
        initializedRef.current = true;
        knownUnreadRef.current = new Map(items.map((item) => [item.id, item.unreadCount]));
        return;
      }

      const onInboxPage = pathname.startsWith("/admin/communication");

      for (const item of items) {
        const prevUnread = knownUnreadRef.current.get(item.id) ?? 0;
        if (item.unreadCount > prevUnread) {
          const name = item.contact.displayName ?? item.contact.profileName ?? item.contact.phoneE164;
          if (!onInboxPage) {
            playPortalSound("adminWhatsApp");
            toast.info("New WhatsApp message", `${name}: ${item.lastMessagePreview ?? "Message"}`);
            if (document.hidden) {
              notifyAdminWhatsAppMessage(name, item.lastMessagePreview ?? "New message");
            }
          }
        }
      }

      knownUnreadRef.current = new Map(items.map((item) => [item.id, item.unreadCount]));
    },
    [pathname]
  );

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/conversations?status=all", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const unread = json.data.reduce(
          (sum: number, item: WhatsAppConversationRow) => sum + item.unreadCount,
          0
        );
        applySnapshot(json.data, unread);
      }
    } catch {
      // ignore refresh errors
    }
  }, [applySnapshot]);

  const handleStreamPayload = useCallback(
    (payload: {
      type: string;
      totalUnread?: number;
      conversations?: WhatsAppConversationRow[];
    }) => {
      if (payload.type !== "update") return;
      applySnapshot(payload.conversations ?? [], payload.totalUnread ?? 0);
    },
    [applySnapshot]
  );

  const connectStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const source = new EventSource("/api/admin/whatsapp/conversations/stream");
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as {
          type: string;
          totalUnread?: number;
          conversations?: WhatsAppConversationRow[];
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

  useEffect(() => {
    void requestBrowserNotificationPermission();
    void refreshConversations();
    connectStream();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        connectStream();
        void refreshConversations();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [connectStream, refreshConversations]);

  return (
    <AdminWhatsAppInboxContext.Provider
      value={{ totalUnread, conversations, refreshConversations }}
    >
      {children}
    </AdminWhatsAppInboxContext.Provider>
  );
}

export function useAdminWhatsAppInbox() {
  const context = useContext(AdminWhatsAppInboxContext);
  if (!context) {
    throw new Error("useAdminWhatsAppInbox must be used within AdminWhatsAppInboxProvider");
  }
  return context;
}

export function useAdminWhatsAppInboxOptional() {
  return useContext(AdminWhatsAppInboxContext);
}
