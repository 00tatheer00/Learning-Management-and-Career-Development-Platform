import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getProgramAttendanceAnalytics } from "@/lib/api/class-attendance";

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("programSlug") ?? "web-development";
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const batch = searchParams.get("batch") ?? undefined;
  const lowAttendanceOnly = searchParams.get("lowAttendance") === "1";
  const recordsPage = Number(searchParams.get("page") ?? "1");
  const recordsPageSize = Number(searchParams.get("pageSize") ?? "25");

  const analytics = await getProgramAttendanceAnalytics({
    programSlug,
    dateFrom,
    dateTo,
    batch,
    lowAttendanceOnly,
    recordsPage: Number.isFinite(recordsPage) ? recordsPage : 1,
    recordsPageSize: Number.isFinite(recordsPageSize) ? recordsPageSize : 25,
  });

  return NextResponse.json(createApiResponse(true, { data: analytics }));
}
