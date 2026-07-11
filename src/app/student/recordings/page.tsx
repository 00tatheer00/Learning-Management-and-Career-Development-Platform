import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { getLiveSessionsPreview } from "@/lib/api/portal-data";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { ModuleStartsSoonNotice } from "@/components/portal/module-starts-soon-notice";
import { StudentRecordingsContent } from "@/components/portal/student-recordings-content";
import {
  getStudentModuleEnrollmentViews,
  studentHasLiveClassAccess,
} from "@/lib/api/student-module-enrollments";
import {
  filterByStudentModule,
  getStudentModuleContentContext,
} from "@/lib/modules/student-module-content";

export default async function StudentRecordingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const moduleContext = await getStudentModuleContentContext(user);
  const moduleEnrollments = user.email
    ? await getStudentModuleEnrollmentViews(user.email, programSlug)
    : [];
  const allSessions = await getLiveSessionsPreview(programSlug);
  const canAccess = studentHasLiveClassAccess(
    programSlug,
    moduleEnrollments,
    user.email,
    allSessions,
    user.level
  );
  const allRecordings = canAccess ? await getClassRecordings(programSlug) : [];
  const recordings = filterByStudentModule(allRecordings, moduleContext, (item) => item.level);

  return (
    <div>
      <PortalPageHeader
        eyebrow="On demand"
        title="Class Recordings"
        description={
          canAccess
            ? "Rewatch completed classes for your module. New recordings appear after your trainer uploads them."
            : "Recordings for your module will appear here when your batch starts."
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
