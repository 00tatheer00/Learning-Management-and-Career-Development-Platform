import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "trainer")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

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
