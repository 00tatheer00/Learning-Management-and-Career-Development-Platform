"use client";

import { useEffect, useState } from "react";
import { Bell, BellRinging } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  areBrowserNotificationsEnabled,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  setBrowserNotificationsEnabled,
} from "@/lib/ui/browser-notifications";
import { playPortalSound, primePortalSounds } from "@/lib/ui/portal-sounds";

export function AdminNotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
    setEnabled(areBrowserNotificationsEnabled());
  }, []);

  const enableNotifications = async () => {
    primePortalSounds();
    const result = await requestBrowserNotificationPermission();
    setPermission(result === "unsupported" ? "unsupported" : result);
    setEnabled(result === "granted" && areBrowserNotificationsEnabled());
    if (result === "granted") {
      playPortalSound("adminNewRegistration");
    }
  };

  const disableNotifications = () => {
    setBrowserNotificationsEnabled(false);
    setEnabled(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center gap-3 mb-3">
        <BellRinging size={24} weight="duotone" className="text-primary" />
        <h2 className="font-bold">Alerts &amp; Sounds</h2>
      </div>
      <p className="text-sm text-muted leading-relaxed mb-4">
        New registrations update in real time with sound. Enable browser notifications to get alerts
        even when this tab is in the background.
      </p>

      <div className="rounded-xl border border-border bg-surface p-4 text-sm space-y-2 mb-4">
        <p>
          <strong>Real-time:</strong> Server push every ~3 seconds (no 30s wait)
        </p>
        <p>
          <strong>Sounds:</strong> New registration, approve, and reject actions
        </p>
        <p>
          <strong>Browser notifications:</strong>{" "}
          {permission === "unsupported"
            ? "Not supported in this browser"
            : permission === "granted" && enabled
              ? "Enabled"
              : permission === "denied"
                ? "Blocked — allow in browser site settings"
                : "Not enabled yet"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {permission !== "granted" || !enabled ? (
          <Button type="button" className="gap-2" onClick={() => void enableNotifications()}>
            <Bell size={18} weight="duotone" />
            Enable Browser Notifications
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={disableNotifications}>
            Disable Browser Notifications
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={() => {
            primePortalSounds();
            playPortalSound("adminApprove");
          }}
        >
          Test Sound
        </Button>
      </div>
    </div>
  );
}
