import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { ModuleStartsSoonNotice } from "@/components/portal/module-starts-soon-notice";
import { StudentRecordingsContent } from "@/components/portal/student-recordings-content";
import {
  getStudentModuleEnrollmentViews,
  studentHasLiveClassAccess,
} from "@/lib/api/student-module-enrollments";

export default async function StudentRecordingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const moduleEnrollments = user.email
    ? await getStudentModuleEnrollmentViews(user.email, programSlug)
    : [];
  const canAccess = studentHasLiveClassAccess(programSlug, moduleEnrollments);
  const recordings = canAccess ? await getClassRecordings(programSlug) : [];

  return (
    <div>
      <PortalPageHeader
        eyebrow="Student Portal"
        title="Class Recordings"
        description={
          canAccess
            ? "Rewatch completed classes. New recordings appear after your trainer uploads them."
            : "Recordings for Module 1 are live now. Your module batch starts next month."
        }
      />
      {!canAccess ? (
        <ModuleStartsSoonNotice programSlug={programSlug} studentModule={user.level} />
      ) : (
        <StudentRecordingsContent programSlug={programSlug} recordings={recordings} />
      )}
    </div>
  );
}
