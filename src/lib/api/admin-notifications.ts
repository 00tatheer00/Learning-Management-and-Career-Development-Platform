import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";

export interface AdminRegistrationAlert {
  id: string;
  fullName: string;
  courseTitle: string;
  program: string;
  level: string;
  createdAt: string;
}

export async function getAdminRegistrationNotifications(): Promise<{
  pendingCount: number;
  pending: AdminRegistrationAlert[];
}> {
  const records = await prisma.enrollment.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      fullName: true,
      program: true,
      level: true,
      createdAt: true,
    },
  });

  const pending = records.map((record) => ({
    id: record.id,
    fullName: record.fullName,
    program: record.program,
    level: record.level,
    createdAt: record.createdAt.toISOString(),
    courseTitle: getProgramBySlug(record.program)?.title ?? record.program,
  }));

  const pendingCount = await prisma.enrollment.count({
    where: { status: "pending" },
  });

  return { pendingCount, pending };
}
