import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireTrainerProgram, resolveTrainerId } from "@/lib/auth/trainer-scope";
import { createApiResponse } from "@/lib/api/enrollment";
import { getTrainerAttendanceAnalytics } from "@/lib/api/class-attendance";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const programSlug = requireTrainerProgram(user);
    const trainerId = resolveTrainerId(user);
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    const dateTo = searchParams.get("dateTo") ?? undefined;
    const batch = searchParams.get("batch") ?? undefined;
    const lowAttendanceOnly = searchParams.get("lowAttendance") === "1";

    const analytics = await getTrainerAttendanceAnalytics(programSlug, trainerId, {
      dateFrom,
      dateTo,
      batch,
      lowAttendanceOnly,
    });

    return NextResponse.json(createApiResponse(true, { data: analytics }));
  } catch {
    return NextResponse.json(
      createApiResponse(false, { error: "Trainer account is not linked to a course." }),
      { status: 400 }
    );
  }
}
