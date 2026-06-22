import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { getAdminCredentialRows } from "@/lib/api/admin-credentials";
import { generateMissingPortalPasswords } from "@/lib/api/admin-credentials-bulk";

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

const postSchema = z.object({
  action: z.literal("generateMissing"),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(createApiResponse(false, { message: "Invalid action" }), {
      status: 400,
    });
  }

  const result = await generateMissingPortalPasswords();
  const message =
    result.generated > 0
      ? `Generated and saved ${result.generated} missing password(s).`
      : "No missing passwords to generate.";

  return NextResponse.json(
    createApiResponse(true, {
      data: result,
      message:
        result.errors.length > 0 ? `${message} ${result.errors.length} error(s).` : message,
    })
  );
}
