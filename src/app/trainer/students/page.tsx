import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { filterStudentsByProgram, getTrainerCourseTitle, getTrainerDesignation } from "@/lib/auth/trainer-scope";
import { getUsersByRole } from "@/lib/auth/users";
import { TrainerStudentsPanel } from "@/components/trainer/trainer-students-panel";
import { EmptyState } from "@/components/portal/portal-ui";

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

  const allStudents = await getUsersByRole("student");
  const students = filterStudentsByProgram(allStudents, user.programSlug).map((student) => ({
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    level: student.level,
    batch: student.batch,
  }));

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
