import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { markStudentPortalSectionSeen } from "@/lib/student-portal/badges";

const schema = z.object({
  section: z.enum(["assignments", "classes"]),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(createApiResponse(false, { message: "Invalid section" }), { status: 400 });
  }

  await markStudentPortalSectionSeen(user.id, parsed.data.section);
  return NextResponse.json(createApiResponse(true, { message: "Marked as seen" }));
}
