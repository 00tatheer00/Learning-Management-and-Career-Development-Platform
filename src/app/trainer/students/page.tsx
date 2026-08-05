import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { filterStudentsByProgram, getTrainerCourseTitle, getTrainerDesignation } from "@/lib/auth/trainer-scope";
import { getUsersByRole } from "@/lib/auth/users";
import { TrainerStudentsPanel } from "@/components/trainer/trainer-students-panel";
import { EmptyState } from "@/components/portal/portal-ui";

import { syncApprovedStudentsTrainerAssignments } from "@/lib/auth/trainer-assignment-sync";

import { getTrainerApprovedStudents } from "@/lib/api/trainer-students-sync";

export default async function TrainerStudentsPage() {
  const user = await getCurrentUser();
  if (!user?.programSlug) {
    return (
      <EmptyState
        title="No course assigned"
        description="Contact admin to link your trainer account to a course."
      />
    );
  }

  void syncApprovedStudentsTrainerAssignments().catch((err) => {
    console.error("Background sync error:", err);
  });

  const students = await getTrainerApprovedStudents(user.programSlug);

  return (
    <Suspense fallback={<p className="text-muted p-4">Loading students…</p>}>
      <TrainerStudentsPanel
        students={students}
        programSlug={user.programSlug}
        courseTitle={getTrainerCourseTitle(user.programSlug)}
        designation={getTrainerDesignation(user.programSlug)}
      />
    </Suspense>
  );
}
