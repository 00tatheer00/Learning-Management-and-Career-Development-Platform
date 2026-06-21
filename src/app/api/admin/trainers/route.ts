import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminTrainerRows } from "@/lib/api/admin-trainers";
import { updateUser } from "@/lib/auth/users";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const rows = await getAdminTrainerRows();
  return NextResponse.json(createApiResponse(true, { data: rows }));
}

const patchSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  designation: z.string().optional(),
  bio: z.string().optional(),
  experience: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
  imagePosition: z.string().optional(),
});

export async function PATCH(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const { id, avatarUrl, expertise, email, ...rest } = parsed.data;

  const updated = await updateUser(id, {
    ...rest,
    email: email?.toLowerCase(),
    expertise,
    avatarUrl: avatarUrl?.trim() ? avatarUrl.trim() : undefined,
  });

  if (!updated || updated.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Trainer not found" }), {
      status: 404,
    });
  }

  return NextResponse.json(
    createApiResponse(true, {
      message: "Trainer profile updated.",
      data: updated,
    })
  );
}
