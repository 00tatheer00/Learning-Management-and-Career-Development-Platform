import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminTrainerRows } from "@/lib/api/admin-trainers";
import { createUser, deleteUser, getUserByEmail, updateUser } from "@/lib/auth/users";
import { getTrainerDesignation } from "@/lib/auth/trainer-scope";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { prisma } from "@/lib/prisma";

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

const profileFields = {
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  designation: z.string().optional(),
  bio: z.string().optional(),
  experience: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
  imagePosition: z.string().optional(),
  programSlug: z.enum(ENROLLABLE_PROGRAM_SLUGS).optional(),
  isActive: z.boolean().optional(),
};

const patchSchema = z.object({
  id: z.string(),
  ...profileFields,
});

const postSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  programSlug: z.enum(ENROLLABLE_PROGRAM_SLUGS),
  phone: z.string().optional(),
  designation: z.string().optional(),
  bio: z.string().optional(),
  experience: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
  imagePosition: z.string().optional(),
});

const deleteSchema = z.object({
  id: z.string(),
});

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  if (await getUserByEmail(email)) {
    return NextResponse.json(createApiResponse(false, { error: "Email already in use." }), {
      status: 409,
    });
  }

  const id = `trainer-${crypto.randomUUID().slice(0, 8)}`;
  const initials = parsed.data.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const trainer = await createUser({
    id,
    email,
    password: parsed.data.password,
    role: "trainer",
    name: parsed.data.name.trim(),
    phone: parsed.data.phone?.trim(),
    programSlug: parsed.data.programSlug,
    trainerId: id,
    designation:
      parsed.data.designation?.trim() ||
      getTrainerDesignation(parsed.data.programSlug),
    bio: parsed.data.bio?.trim(),
    experience: parsed.data.experience?.trim(),
    expertise: parsed.data.expertise ?? [],
    avatarUrl: parsed.data.avatarUrl?.trim(),
    imagePosition: parsed.data.imagePosition?.trim(),
    avatarInitials: initials,
    isActive: true,
  });

  return NextResponse.json(
    createApiResponse(true, {
      message: "Trainer account created.",
      data: trainer,
    })
  );
}

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

  const { id, avatarUrl, expertise, email, programSlug, isActive, ...rest } = parsed.data;

  const updated = await updateUser(id, {
    ...rest,
    email: email?.toLowerCase(),
    expertise,
    programSlug,
    isActive,
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

export async function DELETE(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(createApiResponse(false, { error: "Invalid request." }), {
      status: 400,
    });
  }

  const trainer = await prisma.user.findUnique({ where: { id: parsed.data.id } });
  if (!trainer || trainer.role !== "trainer") {
    return NextResponse.json(createApiResponse(false, { error: "Trainer not found" }), {
      status: 404,
    });
  }

  const profileKey = trainer.trainerId ?? trainer.id;
  const assignedCount = await prisma.user.count({
    where: { role: "student", isActive: true, trainerId: profileKey },
  });

  if (assignedCount > 0) {
    return NextResponse.json(
      createApiResponse(false, {
        error: `Cannot delete — ${assignedCount} active student(s) are assigned to this trainer.`,
      }),
      { status: 409 }
    );
  }

  const deleted = await deleteUser(parsed.data.id);
  if (!deleted) {
    return NextResponse.json(createApiResponse(false, { error: "Delete failed." }), {
      status: 500,
    });
  }

  return NextResponse.json(
    createApiResponse(true, { message: "Trainer deleted." })
  );
}
