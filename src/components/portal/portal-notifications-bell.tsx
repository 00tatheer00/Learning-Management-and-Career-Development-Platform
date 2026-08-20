"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Video,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export function PortalNotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch {
      // ignore network errors
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();

    // Setup live SSE stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/notifications/stream");
      eventSource.addEventListener("notification", (event) => {
        try {
          const newNotif = JSON.parse(event.data) as NotificationItem;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((count) => count + 1);
        } catch {
          // ignore parse error
        }
      });
    } catch {
      // Fallback: regular polling if SSE not supported
      const interval = setInterval(() => {
        void fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchNotifications]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    activeTab === "all" ? true : !n.isRead
  );

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "class":
        return <Video className="w-4 h-4 text-sky-500" />;
      case "assignment":
        return <FileText className="w-4 h-4 text-purple-500" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-elevated/60 transition-all border border-transparent hover:border-border"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-surface/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-border/80 bg-surface/30 p-1 gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex-1 rounded-lg py-1.5 transition-all text-center",
                activeTab === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={cn(
                "flex-1 rounded-lg py-1.5 transition-all text-center",
                activeTab === "unread"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-muted text-xs space-y-1">
                <Bell className="w-8 h-8 mx-auto text-muted/40 mb-2" />
                <p className="font-semibold text-foreground">No notifications</p>
                <p className="text-[11px]">You are all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3.5 flex items-start gap-3 transition-colors text-left relative group",
                    !notification.isRead
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-surface-elevated/40"
                  )}
                >
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-surface border border-border/60">
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs leading-snug line-clamp-1",
                          !notification.isRead ? "font-bold text-foreground" : "font-medium text-foreground/90"
                        )}
                      >
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-muted shrink-0 font-medium">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>

                    {notification.linkUrl && (
                      <Link
                        href={notification.linkUrl}
                        onClick={() => {
                          if (!notification.isRead) markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline pt-0.5"
                      >
                        View details <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-surface border border-transparent hover:border-border text-muted hover:text-foreground transition-all shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
