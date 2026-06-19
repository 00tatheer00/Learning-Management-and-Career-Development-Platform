"use client";

import { useMemo, useState } from "react";
import {
  DownloadSimple,
  MagnifyingGlass,
  Key,
  Prohibit,
  CheckCircle,
  PencilSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { DEFAULT_BATCH_NAME } from "@/lib/constants/batch";
import { getProgramBySlug } from "@/lib/data/programs";
import { formatAppliedDate } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import type { AdminStudentRow } from "@/lib/api/admin-students";

interface AdminStudentsTableProps {
  students: AdminStudentRow[];
}

const BATCH_OPTIONS = [DEFAULT_BATCH_NAME, "Batch 2", "Batch 3"];

export function AdminStudentsTable({ students: initialStudents }: AdminStudentsTableProps) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editStudent, setEditStudent] = useState<AdminStudentRow | null>(null);
  const [editModule, setEditModule] = useState("");
  const [editBatch, setEditBatch] = useState(DEFAULT_BATCH_NAME);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      if (courseFilter !== "all" && student.programSlug !== courseFilter) return false;
      if (statusFilter === "active" && !student.isActive) return false;
      if (statusFilter === "inactive" && student.isActive) return false;
      if (!query) return true;
      return [student.name, student.email, student.whatsapp, student.cnic, student.course]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [students, search, courseFilter, statusFilter]);

  const runAction = async (
    id: string,
    body: Record<string, string>
  ): Promise<boolean> => {
    setLoadingId(id);
    const res = await fetch("/api/admin/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message ?? "Updated.");
      return true;
    }
    toast.error(data.message ?? data.error ?? "Action failed.");
    return false;
  };

  const refreshStudent = (id: string, patch: Partial<AdminStudentRow>) => {
    setStudents((current) =>
      current.map((student) => (student.id === id ? { ...student, ...patch } : student))
    );
  };

  const handleToggleActive = async (student: AdminStudentRow) => {
    const action = student.isActive ? "deactivate" : "activate";
    const ok = await runAction(student.id, { action });
    if (ok) refreshStudent(student.id, { isActive: !student.isActive });
    setLoadingId(null);
  };

  const handleResetPassword = async (student: AdminStudentRow) => {
    const ok = await runAction(student.id, { action: "resetPassword" });
    setLoadingId(null);
    if (!ok) return;
  };

  const openEdit = (student: AdminStudentRow) => {
    setEditStudent(student);
    setEditModule(student.module);
    setEditBatch(student.batch);
  };

  const saveEdit = async () => {
    if (!editStudent) return;
    const ok = await runAction(editStudent.id, {
      action: "update",
      level: editModule,
      batch: editBatch,
    });
    setLoadingId(null);
    if (ok) {
      refreshStudent(editStudent.id, { module: editModule, batch: editBatch });
      setEditStudent(null);
    }
  };

  const moduleOptions = editStudent
    ? (getProgramBySlug(editStudent.programSlug)?.modules.map((mod) => mod.name) ?? [])
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
              className="pl-10"
            />
          </div>
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="all">All courses</option>
            {ENROLLABLE_PROGRAM_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {getProgramBySlug(slug)?.title ?? slug}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | "active" | "inactive")
            }
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="all">All status</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
        <Button asChild variant="secondary" className="gap-2 shrink-0">
          <a href="/api/admin/students/export" download>
            <DownloadSimple size={18} weight="duotone" />
            Export CSV
          </a>
        </Button>
      </div>

      <p className="text-sm text-muted">
        {filtered.length} of {students.length} students shown
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Contact</th>
                <th className="px-4 py-3 text-left font-semibold">CNIC</th>
                <th className="px-4 py-3 text-left font-semibold">Education</th>
                <th className="px-4 py-3 text-left font-semibold">Course</th>
                <th className="px-4 py-3 text-left font-semibold">Module</th>
                <th className="px-4 py-3 text-left font-semibold">Batch</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Applied</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((student) => (
                <tr key={student.id} className="align-top hover:bg-surface/50">
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {student.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{student.fatherName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p>{student.email}</p>
                    <p className="mt-1 text-muted">{student.whatsapp}</p>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs">{student.cnic}</td>
                  <td className="px-4 py-4">
                    <p>{student.institution}</p>
                    <p className="mt-1 text-muted">
                      {student.classSemester} · {student.fieldOfStudy}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-medium">{student.course}</td>
                  <td className="px-4 py-4">{student.module}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {student.batch}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        student.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p>{formatAppliedDate(student.appliedAt)}</p>
                    <p className="mt-1 text-xs text-muted">
                      Joined {formatAppliedDate(student.joinedAt)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        title="Edit module/batch"
                        disabled={loadingId === student.id}
                        onClick={() => openEdit(student)}
                        className="rounded-lg border border-border p-2 hover:bg-surface"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        type="button"
                        title="Reset password"
                        disabled={loadingId === student.id}
                        onClick={() => handleResetPassword(student)}
                        className="rounded-lg border border-border p-2 hover:bg-surface"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        type="button"
                        title={student.isActive ? "Deactivate" : "Activate"}
                        disabled={loadingId === student.id}
                        onClick={() => handleToggleActive(student)}
                        className="rounded-lg border border-border p-2 hover:bg-surface"
                      >
                        {student.isActive ? <Prohibit size={16} /> : <CheckCircle size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={Boolean(editStudent)}
        onClose={() => setEditStudent(null)}
        title="Edit Student"
      >
        {editStudent && (
          <>
            <p className="text-sm text-muted">{editStudent.name}</p>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium">
                Module
                <select
                  value={editModule}
                  onChange={(event) => setEditModule(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  {moduleOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  {!moduleOptions.includes(editModule) && (
                    <option value={editModule}>{editModule}</option>
                  )}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Batch
                <select
                  value={editBatch}
                  onChange={(event) => setEditBatch(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  {BATCH_OPTIONS.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                  {!BATCH_OPTIONS.includes(editBatch) && (
                    <option value={editBatch}>{editBatch}</option>
                  )}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditStudent(null)}>
                Cancel
              </Button>
              <Button disabled={loadingId === editStudent.id} onClick={saveEdit}>
                Save Changes
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
