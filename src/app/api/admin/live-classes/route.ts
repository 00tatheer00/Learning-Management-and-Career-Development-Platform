import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { prisma } from "@/lib/prisma";
import { getProgramBySlug } from "@/lib/data/programs";
import { getJitsiDomain } from "@/lib/portal-video/config";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

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
        configured: true,
        jitsiDomain: getJitsiDomain(),
        portalCount: rows.filter((row) => row.roomType === "portal").length,
        meetCount: rows.filter((row) => row.roomType === "meet").length,
        rows,
      },
    })
  );
}
