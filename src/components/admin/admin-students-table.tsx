"use client";

import { useMemo, useState } from "react";
import {
  DownloadSimple,
  MagnifyingGlass,
  Key,
  Prohibit,
  CheckCircle,
  PencilSimple,
  Trash,
  CaretLeft,
  GraduationCap,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { DEFAULT_BATCH_NAME } from "@/lib/constants/batch";
import { getProgramBySlug } from "@/lib/data/programs";
import { formatAppliedDate } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import { useAdminPermissions } from "@/components/admin/admin-permissions";
import { OpenStudentProfileButton, AdminStudentProfileButton } from "@/components/admin/admin-student-profile-drawer";
import type { AdminStudentRow } from "@/lib/api/admin-students";

interface AdminStudentsTableProps {
  students: AdminStudentRow[];
}

const BATCH_OPTIONS = [DEFAULT_BATCH_NAME, "Batch 2", "Batch 3"];

type BrowseView = "courses" | "modules" | "list";

export function AdminStudentsTable({ students: initialStudents }: AdminStudentsTableProps) {
  const { canWrite } = useAdminPermissions();
  const [students, setStudents] = useState(initialStudents);
  const [browseView, setBrowseView] = useState<BrowseView>("list");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editStudent, setEditStudent] = useState<AdminStudentRow | null>(null);
  const [editModule, setEditModule] = useState("");
  const [editBatch, setEditBatch] = useState(DEFAULT_BATCH_NAME);
  const [deleteTarget, setDeleteTarget] = useState<AdminStudentRow | null>(null);

  const courseStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const slug of ENROLLABLE_PROGRAM_SLUGS) {
      counts[slug] = students.filter((student) => student.programSlug === slug).length;
    }
    return counts;
  }, [students]);

  const moduleCounts = useMemo(() => {
    if (!selectedCourse) return [];
    const program = getProgramBySlug(selectedCourse);
    return (program?.modules ?? []).map((mod) => ({
      name: mod.name,
      count: students.filter(
        (student) => student.programSlug === selectedCourse && student.module === mod.name
      ).length,
    }));
  }, [students, selectedCourse]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      const course = selectedCourse ?? (courseFilter !== "all" ? courseFilter : null);
      if (course && student.programSlug !== course) return false;
      if (selectedModule !== "all" && student.module !== selectedModule) return false;
      if (statusFilter === "active" && !student.isActive) return false;
      if (statusFilter === "inactive" && student.isActive) return false;
      if (!query) return true;
      return [student.name, student.email, student.whatsapp, student.cnic, student.course]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [students, search, courseFilter, selectedCourse, selectedModule, statusFilter, browseView]);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoadingId(deleteTarget.id);
    const res = await fetch("/api/admin/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message ?? "Student deleted.");
      setStudents((current) => current.filter((student) => student.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      toast.error(data.message ?? data.error ?? "Delete failed.");
    }
    setLoadingId(null);
  };

  const moduleOptions = editStudent
    ? (getProgramBySlug(editStudent.programSlug)?.modules.map((mod) => mod.name) ?? [])
    : [];

  return (
    <div className="space-y-4">
      {browseView === "courses" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">Choose a course to browse students by module.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENROLLABLE_PROGRAM_SLUGS.map((slug) => {
              const category = getProgramCategory(slug);
              const program = getProgramBySlug(slug);
              const count = courseStudentCounts[slug] ?? 0;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => {
                    setSelectedCourse(slug);
                    setSelectedModule("all");
                    setBrowseView("modules");
                  }}
                  className="rounded-2xl border-2 border-border bg-background p-6 text-left transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        {category?.shortLabel ?? slug}
                      </p>
                      <h3 className="mt-1 text-xl font-bold">{program?.title ?? slug}</h3>
                      <p className="mt-2 text-sm text-muted">{program?.duration}</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 px-4 py-3 text-center">
                      <p className="text-2xl font-bold text-primary">{count}</p>
                      <p className="text-xs font-semibold text-muted">students</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setBrowseView("list");
              setSelectedCourse(null);
              setSelectedModule("all");
            }}
          >
            View all students ({students.length})
          </Button>
        </div>
      )}

      {browseView === "modules" && selectedCourse && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setBrowseView("courses");
              setSelectedCourse(null);
              setSelectedModule("all");
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <CaretLeft size={16} />
            Back to courses
          </button>
          <div className="rounded-2xl border border-border bg-surface/50 p-4">
            <h3 className="text-lg font-bold">
              {getProgramBySlug(selectedCourse)?.title ?? selectedCourse}
            </h3>
            <p className="text-sm text-muted mt-1">Pick a module to see enrolled students</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedModule("all");
                setBrowseView("list");
              }}
              className="rounded-xl border border-border bg-background p-4 text-left hover:border-primary"
            >
              <p className="font-semibold">All modules</p>
              <p className="text-sm text-muted mt-1">
                {courseStudentCounts[selectedCourse] ?? 0} students
              </p>
            </button>
            {moduleCounts.map((mod, index) => (
              <button
                key={mod.name}
                type="button"
                onClick={() => {
                  setSelectedModule(mod.name);
                  setBrowseView("list");
                }}
                className="rounded-xl border border-border bg-background p-4 text-left hover:border-primary"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Module {index + 1}
                </p>
                <p className="font-semibold mt-1">{mod.name}</p>
                <p className="text-sm text-muted mt-1">
                  {mod.count} student{mod.count === 1 ? "" : "s"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {browseView === "list" && (
        <>
      {selectedCourse && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm">
          <GraduationCap size={18} className="text-primary" />
          <span className="font-semibold">
            {getProgramBySlug(selectedCourse)?.title ?? selectedCourse}
            {selectedModule !== "all" ? ` · ${selectedModule}` : ""}
          </span>
          <button
            type="button"
            onClick={() => setBrowseView("modules")}
            className="ml-auto text-primary font-semibold hover:underline"
          >
            Change module
          </button>
          <button
            type="button"
            onClick={() => {
              setBrowseView("courses");
              setSelectedCourse(null);
              setSelectedModule("all");
            }}
            className="text-muted font-semibold hover:underline"
          >
            All courses
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setBrowseView("courses");
            setSelectedCourse(null);
            setSelectedModule("all");
          }}
          className="gap-1.5"
        >
          <GraduationCap size={16} />
          Browse by course
        </Button>
        <button
          type="button"
          onClick={() => setCourseFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            courseFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background text-muted hover:text-foreground"
          }`}
        >
          All Students ({students.length})
        </button>
        {ENROLLABLE_PROGRAM_SLUGS.map((slug) => {
          const category = getProgramCategory(slug);
          const count = students.filter((student) => student.programSlug === slug).length;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => setCourseFilter(slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                courseFilter === slug
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted hover:text-foreground"
              }`}
            >
              {category?.shortLabel ?? slug} Students ({count})
            </button>
          );
        })}
      </div>

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

      {filtered.length === 0 && (
        <p className="py-10 text-center text-muted rounded-2xl border border-border bg-background">
          {students.length === 0
            ? "No students yet. Approve registrations to create accounts."
            : "No students match your search or filters."}
        </p>
      )}

      {filtered.length > 0 && (
      <>
      <div className="md:hidden space-y-3">
        {filtered.map((student) => (
          <div
            key={student.id}
            className="rounded-2xl border border-border bg-background p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {student.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <OpenStudentProfileButton
                  target={{ studentId: student.id }}
                  className="font-semibold hover:underline"
                >
                  {student.name}
                </OpenStudentProfileButton>
                <p className="text-xs text-muted mt-0.5">{student.fatherName}</p>
                <p className="text-sm text-muted mt-2 break-all">{student.email}</p>
                <p className="text-sm text-muted">{student.whatsapp}</p>
              </div>
              <span
                className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  student.isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {student.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                {student.course}
              </span>
              <span className="rounded-full border border-border px-2.5 py-1">{student.module}</span>
              <span className="rounded-full border border-border px-2.5 py-1">{student.batch}</span>
            </div>
            <p className="mt-2 text-xs text-muted font-mono break-all">{student.cnic}</p>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              <AdminStudentProfileButton target={{ studentId: student.id }} compact />
              {canWrite && (
                <>
                  <button
                    type="button"
                    title="Edit"
                    disabled={loadingId === student.id}
                    onClick={() => openEdit(student)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    title="Reset password"
                    disabled={loadingId === student.id}
                    onClick={() => handleResetPassword(student)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface"
                  >
                    Reset pwd
                  </button>
                  <button
                    type="button"
                    disabled={loadingId === student.id}
                    onClick={() => handleToggleActive(student)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-surface"
                  >
                    {student.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    disabled={loadingId === student.id}
                    onClick={() => setDeleteTarget(student)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
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
                        <OpenStudentProfileButton
                          target={{ studentId: student.id }}
                          className="font-semibold text-foreground hover:underline"
                        >
                          {student.name}
                        </OpenStudentProfileButton>
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
                      <AdminStudentProfileButton target={{ studentId: student.id }} compact />
                      {canWrite && (
                        <>
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
                          <button
                            type="button"
                            title="Delete student"
                            disabled={loadingId === student.id}
                            onClick={() => setDeleteTarget(student)}
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash size={16} weight="duotone" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
        </>
      )}

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

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Student"
      >
        {deleteTarget && (
          <>
            <p className="text-sm text-muted">
              Permanently delete <strong>{deleteTarget.name}</strong> ({deleteTarget.email})?
            </p>
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              This removes their portal account, all registration records, assignment
              submissions, and payment screenshots. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="gap-2 text-red-600 hover:text-red-700"
                disabled={loadingId === deleteTarget.id}
                onClick={confirmDelete}
              >
                <Trash size={16} weight="duotone" />
                Delete Permanently
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
