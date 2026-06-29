"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ClipboardText } from "@phosphor-icons/react";
import { cn, formatAppliedDateTime } from "@/lib/utils";
import { useAdminAlerts } from "@/components/admin/admin-alerts-provider";

export function AdminNotificationsBell() {
  const [open, setOpen] = useState(false);
  const { pendingCount, pending, unreadCount, markAllSeen } = useAdminAlerts();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) markAllSeen();
        }}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-colors hover:bg-secondary",
          unreadCount > 0 && "portal-notif-active"
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} new` : ""}`}
      >
        <Bell size={20} weight={unreadCount > 0 ? "fill" : "duotone"} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {unreadCount === 0 && pendingCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
            <div className="border-b border-border px-4 py-3">
              <p className="font-bold text-foreground">Registrations</p>
              <p className="text-xs text-muted">
                {pendingCount === 0
                  ? "No pending applications"
                  : `${pendingCount} waiting for approval`}
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {pending.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted">All caught up!</p>
              ) : (
                pending.map((item) => (
                  <Link
                    key={item.id}
                    href="/admin/enrollments"
                    onClick={() => setOpen(false)}
                    className="flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-secondary/60 last:border-b-0"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ClipboardText size={18} weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.fullName}</p>
                      <p className="truncate text-xs text-muted">
                        {item.courseTitle} · {item.level}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {formatAppliedDateTime(item.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {pendingCount > 0 && (
              <div className="border-t border-border p-3">
                <Link
                  href="/admin/enrollments"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Review all registrations
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function AdminNavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
