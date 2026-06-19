import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const PAKISTAN_TZ = "Asia/Karachi";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAppliedDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: PAKISTAN_TZ,
  }).format(date);
}

export function formatAppliedDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: PAKISTAN_TZ,
  }).format(date);
}

export function formatAppliedTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PK", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: PAKISTAN_TZ,
  }).format(date);
}
