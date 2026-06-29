"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, MagnifyingGlass } from "@phosphor-icons/react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { Input } from "@/components/ui/input";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { formatAppliedDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { PORTAL_VIEWPORT_PANEL } from "@/lib/constants/portal-layout";
import type { AttendanceReportRow } from "@/lib/api/class-attendance";

interface AttendanceMeta {
  total: number;
  present: number;
  late: number;
}

export default function AdminAttendancePage() {
  const [rows, setRows] = useState<AttendanceReportRow[]>([]);
  const [meta, setMeta] = useState<AttendanceMeta>({ total: 0, present: 0, late: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (programFilter !== "all") params.set("programSlug", programFilter);
      const res = await fetch(`/api/admin/attendance?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        setRows(json.data?.rows ?? []);
        setMeta(json.data?.meta ?? { total: 0, present: 0, late: 0 });
      }
    } finally {
      setLoading(false);
    }
  }, [programFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      [row.studentName, row.sessionTitle, row.sessionDate, row.sessionTime]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [rows, search]);

  return (
    <div className={PORTAL_VIEWPORT_PANEL}>
      <PortalPageHeader
        title="Class Attendance"
        description="Recorded when students tap Join Class in the portal (present / late)."
      />

      <div className="shrink-0 flex flex-wrap gap-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
          <span className="font-bold text-emerald-800">{meta.present}</span>{" "}
          <span className="text-emerald-700">Present</span>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
          <span className="font-bold text-amber-800">{meta.late}</span>{" "}
          <span className="text-amber-700">Late</span>
        </div>
        <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
          <span className="font-bold">{meta.total}</span>{" "}
          <span className="text-muted">Total joins</span>
        </div>
      </div>

      <div className="shrink-0 flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or class..."
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          <FilterPill
            active={programFilter === "all"}
            onClick={() => setProgramFilter("all")}
            label="All"
          />
          {ENROLLABLE_PROGRAM_SLUGS.map((slug) => (
            <FilterPill
              key={slug}
              active={programFilter === slug}
              onClick={() => setProgramFilter(slug)}
              label={getProgramCategory(slug)?.shortLabel ?? slug}
            />
          ))}
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {loading ? (
          <p className="text-center text-sm text-muted py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted py-8">
            No attendance records yet. Students appear here after joining class from the portal.
          </p>
        ) : (
          filtered.map((row) => (
            <div key={row.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{row.studentName}</p>
                <StatusBadge status={row.status} />
              </div>
              <p className="mt-2 text-sm">{row.sessionTitle}</p>
              <p className="mt-1 text-xs text-muted">
                {row.sessionDate} · {row.sessionTime}
              </p>
              <p className="mt-1 text-xs text-muted">
                Joined {formatAppliedDateTime(row.joinedAt)}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block flex-1 min-h-0 overflow-auto rounded-xl border border-border bg-background">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="sticky top-0 bg-surface border-b border-border">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Student</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Class</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Schedule</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Joined</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted">
                  No attendance records yet. Students appear here after joining class from the portal.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-surface/50">
                  <td className="px-3 py-2.5 font-medium">{row.studentName}</td>
                  <td className="px-3 py-2.5">{row.sessionTitle}</td>
                  <td className="px-3 py-2.5 text-muted">
                    {row.sessionDate} · {row.sessionTime}
                  </td>
                  <td className="px-3 py-2.5 text-muted text-xs">
                    {formatAppliedDateTime(row.joinedAt)}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "present" | "late" }) {
  const isPresent = status === "present";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isPresent
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800"
      )}
    >
      {isPresent ? <CheckCircle size={14} weight="fill" /> : <Clock size={14} weight="fill" />}
      {isPresent ? "Present" : "Late"}
    </span>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted hover:border-primary/30"
      )}
    >
      {label}
    </button>
  );
}
