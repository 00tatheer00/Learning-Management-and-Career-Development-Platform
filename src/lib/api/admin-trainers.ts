import { prisma } from "@/lib/prisma";
import { getTrainerDesignation, getTrainerCourseTitle } from "@/lib/auth/trainer-scope";
import { getStaticTrainerByKey } from "@/lib/data/trainer-profiles";
import type { Trainer } from "@/types";

export interface AdminTrainerRow {
  id: string;
  profileKey: string;
  name: string;
  email: string;
  phone?: string;
  programSlug?: string;
  courseTitle: string;
  designation: string;
  studentCount: number;
  bio: string;
  experience?: string;
  expertise: string[];
  avatarUrl?: string;
  imagePosition?: string;
  fallbackImage?: string;
}

function resolveProfileKey(trainer: { id: string; trainerId: string | null }) {
  return trainer.trainerId ?? trainer.id;
}

export async function getTrainerStudentCounts(): Promise<Map<string, number>> {
  const students = await prisma.user.findMany({
    where: { role: "student", isActive: true, trainerId: { not: null } },
    select: { trainerId: true },
  });

  const counts = new Map<string, number>();
  for (const student of students) {
    if (!student.trainerId) continue;
    counts.set(student.trainerId, (counts.get(student.trainerId) ?? 0) + 1);
  }
  return counts;
}

export async function getAdminTrainerRows(): Promise<AdminTrainerRow[]> {
  const [trainers, studentCounts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "trainer" },
      orderBy: [{ programSlug: "asc" }, { name: "asc" }],
    }),
    getTrainerStudentCounts(),
  ]);

  return trainers.map((trainer) => {
    const profileKey = resolveProfileKey(trainer);
    const staticProfile = getStaticTrainerByKey(profileKey);
    const programSlug = trainer.programSlug ?? staticProfile?.programSlug;

    return {
      id: trainer.id,
      profileKey,
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone ?? undefined,
      programSlug: programSlug ?? undefined,
      courseTitle: programSlug ? getTrainerCourseTitle(programSlug) : "—",
      designation:
        trainer.designation ??
        staticProfile?.designation ??
        getTrainerDesignation(programSlug),
      studentCount: studentCounts.get(profileKey) ?? 0,
      bio: trainer.bio ?? staticProfile?.bio ?? "",
      experience: trainer.experience ?? staticProfile?.experience,
      expertise:
        trainer.expertise.length > 0
          ? trainer.expertise
          : (staticProfile?.expertise ?? []),
      avatarUrl: trainer.avatarUrl ?? undefined,
      imagePosition: trainer.imagePosition ?? staticProfile?.imagePosition,
      fallbackImage: staticProfile?.image,
    };
  });
}

export async function getDisplayTrainerProfile(
  trainerKey: string | undefined,
  programSlug: string
): Promise<Trainer | null> {
  const staticTrainers = await import("@/lib/data/trainers").then((m) =>
    m.getTrainersByProgramSlug(programSlug)
  );

  const staticProfile = trainerKey
    ? staticTrainers.find((trainer) => trainer.id === trainerKey)
    : undefined;
  const fallback =
    staticProfile ??
    staticTrainers.find((trainer) => trainer.featured) ??
    staticTrainers[0];

  const dbUser = trainerKey
    ? await prisma.user.findFirst({
        where: {
          role: "trainer",
          OR: [{ id: trainerKey }, { trainerId: trainerKey }],
        },
      })
    : await prisma.user.findFirst({
        where: { role: "trainer", programSlug, isActive: true },
        orderBy: { createdAt: "asc" },
      });

  if (!fallback && !dbUser) return null;

  const base = fallback ?? {
    id: dbUser!.trainerId ?? dbUser!.id,
    name: dbUser!.name,
    designation: getTrainerDesignation(programSlug),
    expertise: [] as string[],
    bio: "",
    social: {},
    programSlug,
  };

  return {
    ...base,
    id: base.id,
    name: dbUser?.name ?? base.name,
    designation: dbUser?.designation ?? base.designation,
    bio: dbUser?.bio ?? base.bio,
    experience: dbUser?.experience ?? base.experience,
    expertise:
      dbUser && dbUser.expertise.length > 0 ? dbUser.expertise : base.expertise,
    image: dbUser?.avatarUrl ?? base.image,
    imagePosition: dbUser?.imagePosition ?? base.imagePosition,
    programSlug: dbUser?.programSlug ?? base.programSlug ?? programSlug,
  };
}
