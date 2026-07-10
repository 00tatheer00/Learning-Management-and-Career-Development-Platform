import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin-access";
import {
  buildAttendanceCsv,
  buildAttendanceExportFilename,
} from "@/lib/api/admin-attendance-export";
import { getAttendanceReport } from "@/lib/api/class-attendance";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("programSlug") ?? "web-development";
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const batch = searchParams.get("batch") ?? undefined;

  let studentIds: string[] | undefined;
  if (batch && batch !== "all") {
    const students = await prisma.user.findMany({
      where: {
        role: "student",
        programSlug,
        isActive: true,
        batch,
      },
      select: { id: true },
    });
    studentIds = students.map((student) => student.id);
  }

  const rows = await getAttendanceReport({
    programSlug,
    dateFrom,
    dateTo,
    studentIds,
    limit: 5000,
  });

  const csv = buildAttendanceCsv(rows);
  const filename = buildAttendanceExportFilename(programSlug);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
