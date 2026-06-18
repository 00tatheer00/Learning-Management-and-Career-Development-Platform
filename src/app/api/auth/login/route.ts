import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, getPortalHome } from "@/lib/auth/session";
import { getUserByEmail } from "@/lib/auth/users";
import { createApiResponse } from "@/lib/api/enrollment";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createApiResponse(false, { message: parsed.error.issues[0]?.message }),
        { status: 400 }
      );
    }

    const user = await getUserByEmail(parsed.data.email);
    if (!user || !user.isActive) {
      return NextResponse.json(
        createApiResponse(false, { message: "Wrong email or password. Try again." }),
        { status: 401 }
      );
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        createApiResponse(false, { message: "Wrong email or password. Try again." }),
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json(
      createApiResponse(true, {
        data: { role: user.role, redirect: getPortalHome(user.role) },
        message: "Login successful",
      })
    );
  } catch {
    return NextResponse.json(
      createApiResponse(false, { error: "Login failed. Please try again." }),
      { status: 500 }
    );
  }
}
