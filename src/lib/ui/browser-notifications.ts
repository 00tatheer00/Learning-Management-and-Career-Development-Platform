const NOTIFICATIONS_ENABLED_KEY = "eest-admin-browser-notifications";

export function isBrowserNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isBrowserNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export function areBrowserNotificationsEnabled() {
  try {
    return localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setBrowserNotificationsEnabled(enabled: boolean) {
  try {
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? "true" : "false");
  } catch {
    // ignore storage errors
  }
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isBrowserNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted") {
    setBrowserNotificationsEnabled(true);
    return "granted";
  }
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  if (result === "granted") setBrowserNotificationsEnabled(true);
  return result;
}

export function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (!isBrowserNotificationSupported()) return;
  if (Notification.permission !== "granted") return;
  if (!areBrowserNotificationsEnabled()) return;

  try {
    const notification = new Notification(title, {
      icon: "/eest-logo.png",
      badge: "/eest-logo.png",
      ...options,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    // ignore notification errors
  }
}

export function notifyAdminNewRegistration(fullName: string, courseTitle: string) {
  showBrowserNotification("New registration", {
    body: `${fullName} applied for ${courseTitle}`,
    tag: "eest-new-registration",
  });
}

export function notifyAdminWhatsAppMessage(contactName: string, preview: string) {
  showBrowserNotification("WhatsApp message", {
    body: `${contactName}: ${preview}`,
    tag: "eest-whatsapp-inbox",
  });
}
