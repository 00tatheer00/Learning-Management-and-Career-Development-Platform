import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiResponse } from "@/lib/api/enrollment";
import { findApplicantEnrollments, mapApplicationSummaries } from "@/lib/api/enrollment-history";
import { normalizeCnic } from "@/lib/utils/payment-screenshot";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  email: z.string().email(),
  cnic: z.string().min(13).max(15),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    email: searchParams.get("email")?.trim().toLowerCase(),
    cnic: normalizeCnic(searchParams.get("cnic") ?? ""),
  });

  if (!parsed.success) {
    return NextResponse.json(
      createApiResponse(false, { message: "Valid email and CNIC are required." }),
      { status: 400 }
    );
  }

  const records = await findApplicantEnrollments(parsed.data.email, parsed.data.cnic);
  const previousApplications = mapApplicationSummaries(records);
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
