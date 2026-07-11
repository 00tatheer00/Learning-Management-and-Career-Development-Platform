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
  refresh: () => Promise<void>;
  markSeen: (section: "assignments" | "classes") => Promise<void>;
}

const StudentPortalBadgesContext = createContext<StudentPortalBadgesState | null>(null);

export function StudentPortalBadgesProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState(0);
  const [classes, setClasses] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/student/badges", { cache: "no-store" });
      const payload = await response.json();
      if (payload.success) {
        setAssignments(payload.data.assignments ?? 0);
        setClasses(payload.data.classes ?? 0);
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
    const intervalId = window.setInterval(() => {
      void refresh();
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  const value = useMemo(
    () => ({ assignments, classes, refresh, markSeen }),
    [assignments, classes, refresh, markSeen]
  );

  return (
    <StudentPortalBadgesContext.Provider value={value}>{children}</StudentPortalBadgesContext.Provider>
  );
}

export function useStudentPortalBadgesOptional() {
  return useContext(StudentPortalBadgesContext);
}
