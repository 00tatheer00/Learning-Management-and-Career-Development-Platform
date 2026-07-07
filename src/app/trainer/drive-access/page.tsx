import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getTrainerCourseTitle, requireTrainerProgram } from "@/lib/auth/trainer-scope";
import { getTrainerPortalStudents } from "@/lib/api/trainer-students";
import { TrainerDriveAccessPanel } from "@/components/trainer/trainer-drive-access-panel";

export default async function TrainerDriveAccessPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") redirect("/login");

  let programSlug: string;
  try {
    programSlug = requireTrainerProgram(user);
  } catch {
    redirect("/trainer/dashboard");
  }

  const students = await getTrainerPortalStudents(programSlug);

  return (
    <TrainerDriveAccessPanel
      students={students}
      courseTitle={getTrainerCourseTitle(programSlug)}
    />
  );
}
