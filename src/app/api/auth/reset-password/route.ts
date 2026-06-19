import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiResponse } from "@/lib/api/enrollment";
import { resetPasswordWithToken } from "@/lib/auth/password-reset";
import { rateLimitByIp } from "@/lib/security/rate-limit";

const schema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  const limited = await rateLimitByIp(request, "reset-password", 10, 60 * 15);
  if (limited) {
    return NextResponse.json(
      createApiResponse(false, {
        message: "Too many attempts. Please try again later.",
      }),
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: parsed.error.issues[0]?.message }),
      { status: 400 }
    );
  }

  const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!result.success) {
    return NextResponse.json(createApiResponse(false, { message: result.error }), {
      status: 400,
    });
  }

  return NextResponse.json(
    createApiResponse(true, {
      message: "Password updated successfully. You can now sign in.",
    })
  );
}
