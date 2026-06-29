import { NextResponse } from "next/server";
import {
  getAdminUser,
  requireAdminWrite,
  unauthorizedAdminResponse,
  isNextResponse,
} from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  getAdminProgramStats,
  repairMissingTrainerAssignments,
} from "@/lib/api/admin-program-stats";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const stats = await getAdminProgramStats();
  return NextResponse.json(createApiResponse(true, { data: stats }));
}

export async function POST() {
  const user = await requireAdminWrite();
  if (isNextResponse(user)) return user;

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
