import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  certificatesEnabledForStudent,
  getStudentCertificateModules,
} from "@/lib/certificates/student-certificates";
import { createApiResponse } from "@/lib/api/enrollment";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), { status: 403 });
  }

  if (!certificatesEnabledForStudent(user.email)) {
    return NextResponse.json(
      createApiResponse(true, { data: { enabled: false, modules: [] as const } })
    );
  }

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        enabled: true,
        modules: getStudentCertificateModules(user),
      },
    })
  );
}
