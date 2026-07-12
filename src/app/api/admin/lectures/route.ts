import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getAdminUser(request);
  if (!user) return unauthorizedAdminResponse();

  try {
    const lectures = await prisma.lecture.findMany({
      orderBy: [
        { programSlug: "asc" },
        { order: "asc" }
      ]
    });
    return NextResponse.json(createApiResponse(true, { data: lectures }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to load lectures";
    return NextResponse.json(
      createApiResponse(false, { error: errorMessage }),
      { status: 500 }
    );
  }
}
