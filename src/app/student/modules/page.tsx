import { getCurrentUser } from "@/lib/auth/session";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { StudentModulesHub } from "@/components/portal/student-modules-hub";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";

export default async function StudentModulesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const moduleContext = await getStudentModuleContentContext(user);
  const primaryProgramSlug = user.programSlug ?? "web-development";

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Portal Hub"
        title="My Modules"
        description="View your unlocked course modules or register for upcoming modules to expand your learning."
      />

      <StudentModulesHub
        currentModule={user.level || null}
        approvedModules={moduleContext.approvedLevels}
        primaryProgramSlug={primaryProgramSlug}
      />
    </div>
  );
}
