import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isDemoPortalStudent } from "@/lib/constants/demo-student";
import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "student") {
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

    // Verify student is approved for this module
    if (!isDemoPortalStudent(user.email)) {
      const approved = await getApprovedEnrollmentLevels(user.email, targetProgram);
      const isApproved = approved.some(
        (l) => l.trim().toLowerCase() === moduleName.trim().toLowerCase()
      );

      if (!isApproved) {
        return NextResponse.json(
          { error: "You are not enrolled in or approved for this module" },
          { status: 403 }
        );
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        level: moduleName.trim(),
        programSlug: targetProgram,
      },
    });

    return NextResponse.json({
      success: true,
      activeModule: moduleName.trim(),
      programSlug: targetProgram,
    });
  } catch (error) {
    console.error("Error switching module:", error);
    return NextResponse.json(
      { error: "Failed to switch module" },
      { status: 500 }
    );
  }
}
