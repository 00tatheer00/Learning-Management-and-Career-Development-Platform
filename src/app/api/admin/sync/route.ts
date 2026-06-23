import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  getAdminProgramStats,
  repairMissingTrainerAssignments,
} from "@/lib/api/admin-program-stats";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const stats = await getAdminProgramStats();
  return NextResponse.json(createApiResponse(true, { data: stats }));
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const result = await repairMissingTrainerAssignments();
  const stats = await getAdminProgramStats();

  return NextResponse.json(
    createApiResponse(true, {
      message:
        result.fixed > 0
          ? `Assigned trainer to ${result.fixed} student(s). Counts should now match.`
          : "No missing trainer assignments found.",
      data: { ...result, stats },
    })
  );
}
