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
} from "@/lib/modules/student-module-content";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";
import {
  fetchMergedByProgram,
  getStudentPortalProgramSlugs,
} from "@/lib/student-portal/program-scope";

export default async function StudentRecordingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlugs = await getStudentPortalProgramSlugs(user);
  const primaryProgramSlug = user.programSlug ?? "web-development";
  const moduleContext = await getStudentModuleContentContext(user);
  const moduleEnrollments = user.email
    ? (await Promise.all(
        programSlugs.map((slug) => getStudentModuleEnrollmentViews(user.email, slug))
      )).flat()
    : [];
  const allSessions = await fetchMergedByProgram(programSlugs, getLiveSessionsPreview);
  const canAccess = studentHasLiveClassAccess(
    primaryProgramSlug,
    moduleEnrollments,
    user.email,
    allSessions,
    user.level
  );
  const allRecordings = canAccess
    ? await fetchMergedByProgram(programSlugs, getClassRecordings)
    : [];
  const recordings = filterByStudentModule(allRecordings, moduleContext, (item) => item.level, (item) => item.programSlug);

  return (
    <div>
      <PortalPageHeader
        eyebrow="On demand"
        title="Class Recordings"
        description={
          canAccess && recordings.length > 0
            ? `Rewatch completed classes for ${user.level || "your module"}. New recordings appear after your trainer uploads them.`
            : `Recordings for ${user.level || "your module"} will appear here when your module classes begin.`
        }
      />
      {!canAccess || recordings.length === 0 ? (
        <div className="space-y-4">
          <ModuleStartsSoonNotice programSlug={primaryProgramSlug} studentModule={user.level} />
        </div>
      ) : (
        <StudentRecordingsContent
          programSlug={primaryProgramSlug}
          recordings={recordings}
          studentModule={user.level || undefined}
        />
      )}
    </div>
  );
}
