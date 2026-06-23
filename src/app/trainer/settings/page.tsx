import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getTrainerCourseTitle, getTrainerDesignation } from "@/lib/auth/trainer-scope";
import { prisma } from "@/lib/prisma";
import { TrainerSettingsPanel } from "@/components/trainer/trainer-settings-panel";

export default async function TrainerSettingsPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");
  if (sessionUser.role !== "trainer") redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect("/login");

  const courseTitle = user.programSlug ? getTrainerCourseTitle(user.programSlug) : "—";

  return (
    <TrainerSettingsPanel
      initial={{
        name: user.name,
        email: user.email,
        phone: user.phone ?? undefined,
        courseTitle,
        designation: user.designation ?? getTrainerDesignation(user.programSlug ?? undefined),
        experience: user.experience ?? undefined,
        bio: user.bio ?? undefined,
        expertise: user.expertise,
        avatarUrl: user.avatarUrl ?? undefined,
        imagePosition: user.imagePosition ?? undefined,
      }}
    />
  );
}
