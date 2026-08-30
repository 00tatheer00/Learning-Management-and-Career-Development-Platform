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

    // Strictly pass ONLY the student's approved/unlocked modules for this course
    const approvedForCourse =
      moduleContext.approvedLevelsByProgram?.[primarySlug] ?? moduleContext.approvedLevels;

    enrolledModules =
      approvedForCourse && approvedForCourse.length > 0
        ? approvedForCourse
        : studentModule
          ? [studentModule]
          : [];
  } catch (err) {
    console.error("[StudentRecordingsPage] Error loading recordings:", err);
    try {
      recordings = await getClassRecordings(primarySlug);
      enrolledModules = studentModule ? [studentModule] : [];
    } catch {
      recordings = [];
      enrolledModules = [];
    }
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
