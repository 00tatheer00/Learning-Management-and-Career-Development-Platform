import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createLiveSession } from "@/lib/api/portal-data";
import { createApiResponse } from "@/lib/api/enrollment";

const schema = z.object({
  title: z.string().min(2),
  date: z.string(),
  time: z.string(),
  meetLink: z.string().url(),
  programSlug: z.string(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(createApiResponse(false, { message: "Please fill all fields correctly" }), { status: 400 });
  }
  const session = await createLiveSession({
    ...parsed.data,
    trainerId: user.trainerId ?? user.id,
    trainerName: user.name,
  });
  return NextResponse.json(createApiResponse(true, { data: session }));
}
