import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminCredentialRows } from "@/lib/api/admin-credentials";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const rows = await getAdminCredentialRows();
  const missingCount = rows.filter((row) => !row.hasStoredPassword).length;

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        rows,
        meta: {
          total: rows.length,
          saved: rows.length - missingCount,
          missing: missingCount,
        },
      },
    })
  );
}
