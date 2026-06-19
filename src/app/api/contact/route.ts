import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { SITE_CONFIG } from "@/lib/constants";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  formatResendError,
  getEmailFromAddress,
  getEmailReplyTo,
} from "@/lib/notifications/email-config";
import { rateLimitByIp } from "@/lib/security/rate-limit";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  const limited = await rateLimitByIp(request, "contact", 5, 60 * 15);
  if (limited) {
    return NextResponse.json(
      createApiResponse(false, { message: "Too many messages. Try again later." }),
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

  const apiKey = process.env.RESEND_API_KEY;
  const from = getEmailFromAddress();
  const to = process.env.CONTACT_INBOX_EMAIL?.trim() || SITE_CONFIG.email;

  if (!apiKey || !from) {
    return NextResponse.json(
      createApiResponse(false, { message: "Contact form is temporarily unavailable." }),
      { status: 503 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: parsed.data.email,
      subject: `[EEST Contact] ${parsed.data.subject}`,
      text: [
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        "",
        parsed.data.message,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <p><strong>Name:</strong> ${parsed.data.name}</p>
          <p><strong>Email:</strong> ${parsed.data.email}</p>
          <hr />
          <p>${parsed.data.message.replace(/\n/g, "<br/>")}</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json(
        createApiResponse(false, { message: formatResendError(error.message) }),
        { status: 500 }
      );
    }

    if (!data?.id) {
      return NextResponse.json(
        createApiResponse(false, { message: "Failed to send message" }),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createApiResponse(true, { message: "Message sent successfully" })
    );
  } catch (error) {
    return NextResponse.json(
      createApiResponse(false, {
        message: error instanceof Error ? error.message : "Failed to send message",
      }),
      { status: 500 }
    );
  }
}
