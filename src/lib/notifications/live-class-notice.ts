import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/services/notification-service";

export async function notifyStudentsOfLiveClass(input: {
  programSlug: string;
  title: string;
  date: string;
  time: string;
  trainerName: string;
}): Promise<void> {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "student",
        programSlug: input.programSlug,
        isActive: true,
      },
      select: { id: true },
    });

    await Promise.all(
      students.map((student) =>
        createNotification({
          userId: student.id,
          title: `Live Class: ${input.title}`,
          message: `${input.trainerName} scheduled a live session on ${input.date} at ${input.time}.`,
          type: "class",
          linkUrl: "/student/classes",
        }).catch(() => null)
      )
    );
  } catch (err) {
    console.error("[LiveClassNotice] Failed to notify students:", err);
  }
}
