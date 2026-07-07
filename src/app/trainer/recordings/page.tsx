import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getTrainerCourseTitle, requireTrainerProgram } from "@/lib/auth/trainer-scope";
import { TrainerRecordingsPanel } from "@/components/trainer/trainer-recordings-panel";

export default async function TrainerRecordingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") redirect("/login");

  let programSlug: string;
  try {
    programSlug = requireTrainerProgram(user);
  } catch {
    redirect("/trainer/dashboard");
  }

  return (
    <TrainerRecordingsPanel
      programSlug={programSlug}
      courseTitle={getTrainerCourseTitle(programSlug)}
    />
  );
}
