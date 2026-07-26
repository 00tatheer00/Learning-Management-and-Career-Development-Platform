import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminWrite, isNextResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";

const promoteSchema = z.object({
  studentIds: z.array(z.string()).min(1).max(100),
  nextLevel: z.string().min(1),
  nextBatch: z.string().optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdminWrite();
  if (isNextResponse(admin)) return admin;

  try {
    const body = await request.json();
    const parsed = promoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        createApiResponse(false, { message: parsed.error.issues[0]?.message }),
        { status: 400 }
      );
    }

    const { studentIds, nextLevel, nextBatch } = parsed.data;

    const result = await prisma.user.updateMany({
      where: { id: { in: studentIds } },
      data: {
        level: nextLevel,
        ...(nextBatch ? { batch: nextBatch } : {}),
      },
    });

    return NextResponse.json(
      createApiResponse(true, {
        message: `Successfully promoted ${result.count} student(s) to ${nextLevel}${
          nextBatch ? ` (${nextBatch})` : ""
        }.`,
        count: result.count,
      })
    );
  } catch (error) {
    console.error("Bulk student promotion error:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to promote students" }),
      { status: 500 }
    );
  }
}
