import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { StudentRecordingsContent } from "@/components/portal/student-recordings-content";
import { getProgramBySlug } from "@/lib/data/programs";
import { filterByStudentModule } from "@/lib/modules/student-module-content";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";
import { getProgramModuleNames } from "@/lib/modules/student-module-access";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import {
  fetchMergedByProgram,
  getStudentPortalProgramSlugs,
} from "@/lib/student-portal/program-scope";

export default async function StudentDriveRecordingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/login");

  const programSlugs = await getStudentPortalProgramSlugs(user);
  const primarySlug = programSlugs[0] ?? user.programSlug ?? "web-development";
  const isDemo = isDemoPortalStudent(user.email);
  const moduleContext = await getStudentModuleContentContext(user);

  const allRecordings = await fetchMergedByProgram(programSlugs, getClassRecordings);
  const recordings = filterByStudentModule(
    allRecordings,
    moduleContext,
    (item) => item.level,
    (item) => item.programSlug
  );

  const programModules = getProgramModuleNames(primarySlug);

  return (
    <div className="space-y-6 pb-16">
      <StudentRecordingsContent
        programSlug={primarySlug}
        recordings={recordings}
        studentModule={moduleContext.effectiveLevel || undefined}
        modules={programModules}
      />
    </div>
  );
}
