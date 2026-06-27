import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAttendanceReport } from "@/lib/api/class-attendance";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("programSlug") ?? undefined;
  const sessionId = searchParams.get("sessionId") ?? undefined;

  const rows = await getAttendanceReport({ programSlug, sessionId });
  const present = rows.filter((row) => row.status === "present").length;
  const late = rows.filter((row) => row.status === "late").length;

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        rows,
        meta: { total: rows.length, present, late },
      },
    })
  );
}
