import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin-access";
import {
  buildEnrollmentsCsv,
  buildEnrollmentsExportFilename,
  getAdminEnrollmentRows,
} from "@/lib/api/admin-enrollments";
import type { PhaseFilter } from "@/lib/services/phase-service";

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "all";
  const program = searchParams.get("program") ?? "all";
  const phase = (searchParams.get("phase") as PhaseFilter) ?? "all";
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  let rows = await getAdminEnrollmentRows({ phase, status: status === "all" ? undefined : status });

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
  const filename = buildEnrollmentsExportFilename(status, phase);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
