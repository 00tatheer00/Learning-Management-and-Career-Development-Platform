import { prisma } from "@/lib/prisma";

export async function getTrainerPortalStudents(programSlug: string) {
  return prisma.user.findMany({
    where: {
      role: "student",
      programSlug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });
}
