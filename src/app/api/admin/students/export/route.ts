import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin-access";
import {
  buildStudentsCsv,
  buildStudentsExportFilename,
  getAdminStudentRows,
} from "@/lib/api/admin-students";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const rows = await getAdminStudentRows();
  const csv = buildStudentsCsv(rows);
  const filename = buildStudentsExportFilename();

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
