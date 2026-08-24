"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface StudentPortalBadgesState {
  assignments: number;
  classes: number;
  certificates: number;
  refresh: () => Promise<void>;
  markSeen: (section: "assignments" | "classes") => Promise<void>;
}

const StudentPortalBadgesContext = createContext<StudentPortalBadgesState | null>(null);

export function StudentPortalBadgesProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState(0);
  const [classes, setClasses] = useState(0);
  const [certificates, setCertificates] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/student/badges", { cache: "no-store" });
      const payload = await response.json();
      if (payload.success) {
        setAssignments(payload.data.assignments ?? 0);
        setClasses(payload.data.classes ?? 0);
        setCertificates(payload.data.certificates ?? 0);
      }
    } catch {
      // Ignore transient network errors.
    }
  }, []);

  const markSeen = useCallback(
    async (section: "assignments" | "classes") => {
      try {
        await fetch("/api/student/badges/seen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section }),
        });
      } catch {
        // Ignore transient network errors.
      }
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();

    let lastFetch = Date.now();
    const pollInterval = 90_000;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        lastFetch = Date.now();
        void refresh();
      }
    }, pollInterval);

    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetch >= 20_000) {
        lastFetch = Date.now();
        void refresh();
      }
    };

    document.addEventListener("visibilitychange", onFocusOrVisible);
    window.addEventListener("focus", onFocusOrVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
      window.removeEventListener("focus", onFocusOrVisible);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ assignments, classes, certificates, refresh, markSeen }),
    [assignments, classes, certificates, refresh, markSeen]
  );

  return (
    <StudentPortalBadgesContext.Provider value={value}>{children}</StudentPortalBadgesContext.Provider>
  );
}

export function useStudentPortalBadgesOptional() {
  return useContext(StudentPortalBadgesContext);
}
