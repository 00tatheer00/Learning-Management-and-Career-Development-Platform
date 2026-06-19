import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiResponse } from "@/lib/api/enrollment";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendForgotPasswordNotifications } from "@/lib/notifications/forgot-password-notice";
import { prisma } from "@/lib/prisma";
import { rateLimitByIp } from "@/lib/security/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const limited = await rateLimitByIp(request, "forgot-password", 5, 60 * 15);
  if (limited) {
    return NextResponse.json(
      createApiResponse(false, {
        message: "Too many reset attempts. Please try again in 15 minutes.",
      }),
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: "Valid email is required" }),
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const token = await createPasswordResetToken(email);

  // Always return success to avoid email enumeration
  const genericMessage =
    "If an account exists with this email, reset instructions have been sent.";

  if (!token) {
    return NextResponse.json(createApiResponse(true, { message: genericMessage }));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(createApiResponse(true, { message: genericMessage }));
  }

  void sendForgotPasswordNotifications({
    name: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    token,
  });

  return NextResponse.json(createApiResponse(true, { message: genericMessage }));
}
