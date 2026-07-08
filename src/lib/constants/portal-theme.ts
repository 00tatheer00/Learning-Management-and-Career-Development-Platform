export type PortalThemeMode = "light" | "dark";

export const PORTAL_THEME_STORAGE_KEY = "eest-portal-theme";

export function getStoredPortalTheme(fallback: PortalThemeMode = "light"): PortalThemeMode {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(PORTAL_THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return fallback;
  } catch {
    return fallback;
  }
}
