import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  getAllWebDevModule1Assignments,
  autoAssignTopicsForWebDevStudents,
} from "@/lib/assignments/topic-assignment-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin" && user.role !== "admin_readonly")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const assignments = await getAllWebDevModule1Assignments();
    return NextResponse.json(createApiResponse(true, { data: assignments }));
  } catch (error) {
    console.error("Error fetching automated assignments:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Could not fetch automated assignments" }),
      { status: 500 }
    );
  }
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  try {
    const result = await autoAssignTopicsForWebDevStudents();
    const assignments = await getAllWebDevModule1Assignments();

    return NextResponse.json(
      createApiResponse(true, {
        data: {
          result,
          assignments,
        },
        message: `Assigned topics to ${result.assignedCount} new student(s). Total active: ${result.totalEligible}`,
      })
    );
  } catch (error) {
    console.error("Error running auto-topic assignment:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to run automated topic assignment" }),
      { status: 500 }
    );
  }
}
