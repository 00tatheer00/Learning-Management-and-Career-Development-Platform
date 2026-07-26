"use client";

import { useState } from "react";
import { Users, CheckCircle2, AlertTriangle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface StudentProgressMetric {
  id: string;
  name: string;
  email: string;
  programSlug: string;
  level: string;
  batch: string;
  attendancePercent: number;
  classesAttended: number;
  totalClasses: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
  status: "active" | "at_risk" | "inactive";
}

export function AdminStudentProgressMatrix({
  students,
}: {
  students: StudentProgressMetric[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.programSlug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Student Attendance & Progress Matrix
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Real-time overview of student participation, attendance %, and task completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-xs w-48 sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border text-xs">
            <Filter size={12} className="text-muted ml-1" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="at_risk">At Risk</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-muted/60 text-muted font-bold uppercase tracking-wider border-b border-border/80">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Program / Module</th>
              <th className="p-3 text-center">Attendance %</th>
              <th className="p-3 text-center">Classes Attended</th>
              <th className="p-3 text-center">Assignments</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  No student metrics found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted">{s.email}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold text-foreground capitalize">{s.programSlug.replace("-", " ")}</p>
                    <p className="text-[11px] text-muted">{s.level} · {s.batch}</p>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold">{s.attendancePercent}%</span>
                      <div className="w-16 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.attendancePercent >= 75
                              ? "bg-emerald-500"
                              : s.attendancePercent >= 50
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, s.attendancePercent)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {s.classesAttended} / {s.totalClasses}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {s.assignmentsSubmitted} / {s.totalAssignments}
                  </td>
                  <td className="p-3 text-right">
                    {s.status === "active" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1">
                        <CheckCircle2 size={10} /> Active
                      </Badge>
                    ) : s.status === "at_risk" ? (
                      <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 gap-1">
                        <AlertTriangle size={10} /> At Risk
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/15 text-red-700 border-red-500/30">
                        Inactive
                      </Badge>
                    )}
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
