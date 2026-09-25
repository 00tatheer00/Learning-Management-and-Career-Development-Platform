import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { StudentRecordingsContent } from "@/components/portal/student-recordings-content";
import { filterByStudentModule } from "@/lib/modules/student-module-content";
import { getStudentModuleContentContext } from "@/lib/modules/student-module-content-server";
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

  let primarySlug = user.programSlug || "web-development";
  let recordings: Awaited<ReturnType<typeof getClassRecordings>> = [];
  let studentModule: string | undefined = user.level?.trim() || undefined;
  let enrolledModules: string[] = [];

  try {
    const programSlugs = await getStudentPortalProgramSlugs(user);
    primarySlug = programSlugs[0] ?? user.programSlug ?? "web-development";
    const moduleContext = await getStudentModuleContentContext(user);
    studentModule = moduleContext.studentLevel || user.level?.trim() || undefined;

    const allRecordings = await fetchMergedByProgram(
      programSlugs.length > 0 ? programSlugs : [primarySlug],
      getClassRecordings
    );

    recordings = filterByStudentModule(
      allRecordings || [],
      moduleContext,
      (item) => item.level,
      (item) => item.programSlug
    );

    // Collect approved modules from ALL enrolled programs (not just primary)
    // so the UI module filter tabs show modules from every enrolled program.
    const allApprovedModules: string[] = [];
    if (moduleContext.approvedLevelsByProgram) {
      for (const levels of Object.values(moduleContext.approvedLevelsByProgram)) {
        allApprovedModules.push(...levels);
      }
    }

    enrolledModules =
      allApprovedModules.length > 0
        ? [...new Set(allApprovedModules)]
        : moduleContext.approvedLevels.length > 0
          ? moduleContext.approvedLevels
          : studentModule
            ? [studentModule]
            : [];
  } catch (err) {
    console.error("[StudentRecordingsPage] Error loading recordings:", err);
    recordings = [];
    enrolledModules = studentModule ? [studentModule] : [];
  }

  return (
    <div className="space-y-6 pb-16">
      <StudentRecordingsContent
        programSlug={primarySlug}
        recordings={recordings || []}
        studentModule={studentModule}
        modules={enrolledModules}
      />
    </div>
  );
}
