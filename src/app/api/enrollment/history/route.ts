import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiResponse } from "@/lib/api/enrollment";
import { findApplicantEnrollments, mapApplicationSummaries } from "@/lib/api/enrollment-history";
import { rateLimitByIp } from "@/lib/security/rate-limit";
import { normalizeCnic } from "@/lib/utils/payment-screenshot";

export const dynamic = "force-dynamic";

const cnicRegex = /^\d{13}$/;

const querySchema = z.object({
  email: z.string().email(),
  cnic: z
    .string()
    .transform((value) => normalizeCnic(value))
    .pipe(z.string().regex(cnicRegex, "CNIC must be exactly 13 digits")),
});

export async function GET(request: Request) {
  const limited = await rateLimitByIp(request, "enrollment-history", 10, 60 * 15);
  if (limited) {
    return NextResponse.json(
      createApiResponse(false, { message: "Too many requests. Try again later." }),
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    email: searchParams.get("email")?.trim().toLowerCase(),
    cnic: searchParams.get("cnic") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: "Valid email and 13-digit CNIC are required." }),
      { status: 400 }
    );
  }

  const records = await findApplicantEnrollments(parsed.data.email, parsed.data.cnic);
  const previousApplications = mapApplicationSummaries(records, { includePaymentScreenshots: false });
  const applicationNumber = previousApplications.length + 1;

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        applicationNumber,
        previousCount: previousApplications.length,
        isReturningApplicant: previousApplications.length > 0,
        previousApplications: [...previousApplications].reverse(),
        applicantName: records[0]?.fullName,
      },
    })
  );
}
