import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/auth/admin-roles";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "trainer" && !isAdminRole(user.role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { moduleName, programSlug } = body;

    if (!moduleName || typeof moduleName !== "string") {
      return NextResponse.json(
        { error: "Module name is required" },
        { status: 400 }
      );
    }

    const targetProgram = programSlug || user.programSlug || "web-development";
    const newLevel = moduleName.trim();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        level: newLevel,
        ...(programSlug ? { programSlug } : {}),
      },
    });

    const response = NextResponse.json({
      success: true,
      activeModule: newLevel,
      programSlug: targetProgram,
    });

    // Also set a trainer-module cookie for fallback sync
    response.cookies.set("trainer_active_module", newLevel, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error switching trainer module:", error);
    return NextResponse.json(
      { error: "Failed to switch module" },
      { status: 500 }
    );
  }
}
