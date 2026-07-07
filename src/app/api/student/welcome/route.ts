import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  getPendingPortalWelcome,
  markPortalWelcomeShown,
} from "@/lib/api/student-portal-welcome";

export async function GET() {
  try {
    const user = await requireRole(["student"]);
    const pending = await getPendingPortalWelcome(user.email, user.programSlug);

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          pending,
          studentName: user.name,
        },
      })
    );
  } catch {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 401,
    });
  }
}

const postSchema = z.object({
  enrollmentId: z.string(),
});

export async function POST(request: Request) {
  try {
    const user = await requireRole(["student"]);
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(createApiResponse(false, { message: "Invalid request" }), {
        status: 400,
      });
    }

    const marked = await markPortalWelcomeShown(user.email, parsed.data.enrollmentId);
    if (!marked) {
      return NextResponse.json(createApiResponse(false, { error: "Enrollment not found" }), {
        status: 404,
      });
    }

    return NextResponse.json(createApiResponse(true, { message: "Welcome marked as shown." }));
  } catch {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 401,
    });
  }
}
