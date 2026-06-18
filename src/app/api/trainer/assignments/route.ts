import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createAssignment } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  dueDate: z.string(),
  programSlug: z.string(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(createApiResponse(false, { message: "Invalid data" }), { status: 400 });
  }
  const assignment = await createAssignment({
    ...parsed.data,
    trainerId: user.trainerId ?? user.id,
  });
  return NextResponse.json(createApiResponse(true, { data: assignment }));
}
