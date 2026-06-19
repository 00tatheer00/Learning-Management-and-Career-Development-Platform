import { SITE_CONFIG } from "@/lib/constants";

export function getPortalUrl(): string {
  const base = process.env.NEXTAUTH_URL ?? SITE_CONFIG.url;
  return base.replace(/\/$/, "");
}

export function getPortalLoginUrl(): string {
  return `${getPortalUrl()}/login`;
}
