export type PortalThemeMode = "light" | "dark";

export const PORTAL_THEME_STORAGE_KEY = "eest-portal-theme";

export function getStoredPortalTheme(): PortalThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(PORTAL_THEME_STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}
