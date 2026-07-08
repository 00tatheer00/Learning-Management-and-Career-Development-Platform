"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  getStoredPortalTheme,
  PORTAL_THEME_STORAGE_KEY,
  type PortalThemeMode,
} from "@/lib/constants/portal-theme";

interface PortalThemeContextValue {
  theme: PortalThemeMode;
  isDark: boolean;
  setTheme: (mode: PortalThemeMode) => void;
  toggleTheme: () => void;
}

const PortalThemeContext = createContext<PortalThemeContextValue | null>(null);

export function PortalThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  defaultTheme?: PortalThemeMode;
}) {
  const [theme, setThemeState] = useState<PortalThemeMode>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const init = document.documentElement.dataset.portalThemeInit;
    if (init === "dark" || init === "light") return init;
    return getStoredPortalTheme(defaultTheme);
  });

  useLayoutEffect(() => {
    setThemeState(getStoredPortalTheme(defaultTheme));
  }, [defaultTheme]);

  const setTheme = useCallback((mode: PortalThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(PORTAL_THEME_STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(PORTAL_THEME_STORAGE_KEY, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <PortalThemeContext.Provider value={value}>{children}</PortalThemeContext.Provider>
  );
}

export function usePortalTheme() {
  const ctx = useContext(PortalThemeContext);
  if (!ctx) {
    throw new Error("usePortalTheme must be used within PortalThemeProvider");
  }
  return ctx;
}

export function usePortalThemeOptional() {
  return useContext(PortalThemeContext);
}
