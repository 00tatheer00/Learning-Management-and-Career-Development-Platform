import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";
import { isLiveKitConfigured } from "@/lib/livekit/config";
import { getProgramBySlug } from "@/lib/data/programs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const sessions = await prisma.liveSession.findMany({
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });

  const rows = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    date: session.date,
    time: session.time,
    programSlug: session.programSlug,
    courseTitle: getProgramBySlug(session.programSlug)?.title ?? session.programSlug,
    trainerName: session.trainerName,
    roomType: session.roomType === "portal" ? "portal" : "meet",
    meetLink: session.meetLink,
  }));

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        configured: isLiveKitConfigured(),
        portalCount: rows.filter((row) => row.roomType === "portal").length,
        meetCount: rows.filter((row) => row.roomType === "meet").length,
        rows,
      },
    })
  );
}
