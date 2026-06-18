import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { updateSubmission } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";

const schema = z.object({
  id: z.string(),
  status: z.enum(["approved", "needs_revision"]),
  feedback: z.string().optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(createApiResponse(false, { message: "Invalid data" }), { status: 400 });
  }
  const submission = await updateSubmission(parsed.data.id, {
    status: parsed.data.status,
    feedback: parsed.data.feedback,
  });
  return NextResponse.json(createApiResponse(true, { data: submission }));
}
