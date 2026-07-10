import type { AttendanceReportRow } from "@/lib/api/class-attendance";

function escapeCsv(value: string | number | null | undefined): string {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildAttendanceCsv(rows: AttendanceReportRow[]): string {
  const header = [
    "Student",
    "Class",
    "Date",
    "Time",
    "Status",
    "Joined At",
    "Program",
  ];

  const lines = rows.map((row) =>
    [
      row.studentName,
      row.sessionTitle,
      row.sessionDate,
      row.sessionTime,
      row.status,
      row.joinedAt,
      row.programSlug,
    ]
      .map(escapeCsv)
      .join(",")
  );

  return [header.join(","), ...lines].join("\r\n");
}

export function buildAttendanceExportFilename(programSlug: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `attendance-${programSlug}-${date}.csv`;
}
