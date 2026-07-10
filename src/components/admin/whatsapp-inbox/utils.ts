import { formatAppliedDate, formatAppliedTime } from "@/lib/utils";
import type { WhatsAppMessageRow } from "@/lib/api/whatsapp-crm";

const PAKISTAN_TZ = "Asia/Karachi";

function toKarachiDate(iso: string): Date {
  return new Date(iso);
}

function dayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PAKISTAN_TZ }).format(date);
}

export function formatWaListTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = toKarachiDate(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const today = dayKey(now);
  const msgDay = dayKey(date);

  if (msgDay === today) return formatAppliedTime(iso);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (msgDay === dayKey(yesterday)) return "Yesterday";

  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    timeZone: PAKISTAN_TZ,
  }).format(date);
}

export function formatWaDaySeparator(iso: string): string {
  const date = toKarachiDate(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  if (dayKey(date) === dayKey(now)) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dayKey(date) === dayKey(yesterday)) return "Yesterday";

  return formatAppliedDate(iso);
}

export function groupMessagesByDay(messages: WhatsAppMessageRow[]) {
  const groups: Array<{ label: string; messages: WhatsAppMessageRow[] }> = [];

  for (const message of messages) {
    const label = formatWaDaySeparator(message.createdAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) {
      last.messages.push(message);
    } else {
      groups.push({ label, messages: [message] });
    }
  }

  return groups;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function avatarColor(seed: string): string {
  const colors = [
    "bg-[#6bcbef]",
    "bg-[#eaa59a]",
    "bg-[#7bc77b]",
    "bg-[#f2b96f]",
    "bg-[#bc91d8]",
    "bg-[#8e8ed6]",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length]!;
}
