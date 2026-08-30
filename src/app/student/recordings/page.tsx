import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { StudentRecordingsContent } from "@/components/portal/student-recordings-content";
import { filterByStudentModule } from "@/lib/modules/student-module-content";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";
import { getProgramModuleNames } from "@/lib/modules/student-module-access";
import {
  fetchMergedByProgram,
  getStudentPortalProgramSlugs,
} from "@/lib/student-portal/program-scope";

export const metadata: Metadata = {
  title: "Class Recordings | Student Portal",
  description: "Access your class recordings, Google Drive archives, and study notes.",
};

export default async function StudentRecordingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") redirect("/login");

  const programSlugs = await getStudentPortalProgramSlugs(user);
  const primarySlug = programSlugs[0] ?? user.programSlug ?? "web-development";
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
        studentModule={moduleContext.studentLevel || undefined}
        modules={programModules}
      />
    </div>
  );
}
