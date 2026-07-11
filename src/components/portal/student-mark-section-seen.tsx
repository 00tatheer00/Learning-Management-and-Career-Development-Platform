"use client";

import { useEffect } from "react";
import { useStudentPortalBadgesOptional } from "@/components/portal/student-portal-badges-provider";

export function StudentMarkSectionSeen({
  section,
}: {
  section: "assignments" | "classes";
}) {
  const badges = useStudentPortalBadgesOptional();

  useEffect(() => {
    void badges?.markSeen(section);
  }, [badges, section]);

  return null;
}
