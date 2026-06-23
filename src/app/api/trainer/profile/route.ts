import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { updateUser } from "@/lib/auth/users";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  bio: z.string().optional(),
  experience: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
  imagePosition: z.string().optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
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

  const { avatarUrl, expertise, ...rest } = parsed.data;

  const updated = await updateUser(user.id, {
    ...rest,
    expertise,
    avatarUrl: avatarUrl?.trim() ? avatarUrl.trim() : undefined,
  });

  if (!updated) {
    return NextResponse.json(createApiResponse(false, { error: "Update failed." }), {
      status: 500,
    });
  }

  return NextResponse.json(
    createApiResponse(true, {
      message: "Profile updated.",
      data: {
        name: updated.name,
        phone: updated.phone,
        designation: updated.designation,
        bio: updated.bio,
        experience: updated.experience,
        expertise: updated.expertise ?? [],
        avatarUrl: updated.avatarUrl,
        imagePosition: updated.imagePosition,
      },
    })
  );
}
