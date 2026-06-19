import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  buildEnrollmentsCsv,
  buildEnrollmentsExportFilename,
  getAdminEnrollmentRows,
} from "@/lib/api/admin-enrollments";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "all";
  const program = searchParams.get("program") ?? "all";
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  let rows = await getAdminEnrollmentRows();

  if (status !== "all") {
    rows = rows.filter((row) => row.status === status);
  }

  if (program !== "all") {
    rows = rows.filter((row) => row.program === program);
  }

  if (query) {
    rows = rows.filter((row) =>
      [
        row.fullName,
        row.email,
        row.whatsapp,
        row.cnic,
        row.fatherName,
        row.institution,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  const csv = buildEnrollmentsCsv(rows);
  const filename = buildEnrollmentsExportFilename(status);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
