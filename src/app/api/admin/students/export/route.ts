import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin-access";
import {
  buildStudentsCsv,
  buildStudentsExportFilename,
  filterAdminStudentRows,
  getAdminStudentRows,
} from "@/lib/api/admin-students";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const program = searchParams.get("program") ?? "all";
  const moduleFilter = searchParams.get("module") ?? "all";
  const activeOnly = searchParams.get("active") === "1";

  if (program !== "all" && !ENROLLABLE_PROGRAM_SLUGS.includes(program as (typeof ENROLLABLE_PROGRAM_SLUGS)[number])) {
    return NextResponse.json({ error: "Invalid program" }, { status: 400 });
  }

  const allRows = await getAdminStudentRows();
  const rows = filterAdminStudentRows(allRows, {
    program: program === "all" ? undefined : program,
    module: moduleFilter === "all" ? undefined : moduleFilter,
    activeOnly,
  });

  const csv = buildStudentsCsv(rows);
  const filename = buildStudentsExportFilename(
    program === "all" ? undefined : program,
    moduleFilter === "all" ? undefined : moduleFilter
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
