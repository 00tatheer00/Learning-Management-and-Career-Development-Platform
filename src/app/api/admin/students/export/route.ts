import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  buildStudentsCsv,
  buildStudentsExportFilename,
  getAdminStudentRows,
} from "@/lib/api/admin-students";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
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
