"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Clock,
  CalendarBlank,
  MagnifyingGlass,
  DownloadSimple,
  CheckSquare,
  Trash,
  Copy,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { formatAppliedDate, formatAppliedDateTime, formatAppliedTime } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import { playPortalSound, primePortalSounds } from "@/lib/ui/portal-sounds";
import { Alert } from "@/components/ui/alert";
import type { AdminEnrollmentRow } from "@/lib/api/admin-enrollments";

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type PendingAction = { id: string; type: "approved" | "rejected"; name: string };

export function AdminEnrollmentsPanel() {
  const [enrollments, setEnrollments] = useState<AdminEnrollmentRow[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    status: string;
  } | null>(null);
  const [approvedCredentials, setApprovedCredentials] = useState<{
    name: string;
    loginId: string;
    password: string;
    loginUrl: string;
  } | null>(null);

  const load = async () => {
    setFetchError("");
    try {
      const res = await fetch("/api/admin/enrollments");
      const data = await res.json();
      if (data.success) {
        setEnrollments(data.data ?? []);
      } else {
        const err = data.error ?? "Failed to load registrations";
        setFetchError(err);
        toast.error("Could not load registrations", err);
      }
    } catch {
      setFetchError("Failed to load registrations");
      toast.error("Could not load registrations");
    }
  };

  useEffect(() => {
    load();
    primePortalSounds();
  }, []);

  const programCounts = useMemo(() => {
    const base = enrollments.filter((enrollment) =>
      statusFilter === "all" ? true : enrollment.status === statusFilter
    );

    const all = base.length;
    const perProgram: Record<string, number> = {};
    for (const slug of ENROLLABLE_PROGRAM_SLUGS) {
      perProgram[slug] = base.filter((enrollment) => enrollment.program === slug).length;
    }

    return { all, perProgram };
  }, [enrollments, statusFilter]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrollments.filter((enrollment) => {
      if (statusFilter !== "all" && enrollment.status !== statusFilter) return false;
      if (programFilter !== "all" && enrollment.program !== programFilter) return false;
      if (!query) return true;
      return [
        enrollment.fullName,
        enrollment.email,
        enrollment.whatsapp,
        enrollment.cnic,
        enrollment.fatherName,
        enrollment.institution,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [enrollments, statusFilter, programFilter, search]);

  const pendingCount = enrollments.filter((e) => e.status === "pending").length;
  const pendingFilteredIds = filtered.filter((e) => e.status === "pending").map((e) => e.id);
  const allPendingSelected =
    pendingFilteredIds.length > 0 &&
    pendingFilteredIds.every((id) => selectedIds.includes(id));

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (programFilter !== "all") params.set("program", programFilter);
    if (search.trim()) params.set("q", search.trim());
    const query = params.toString();
    return `/api/admin/enrollments/export${query ? `?${query}` : ""}`;
  }, [statusFilter, programFilter, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelectAllPending = () => {
    if (allPendingSelected) {
      setSelectedIds((current) => current.filter((id) => !pendingFilteredIds.includes(id)));
    } else {
      setSelectedIds((current) => [...new Set([...current, ...pendingFilteredIds])]);
    }
  };

  const runAction = async (id: string, status: "approved" | "rejected", adminNotes?: string) => {
    setLoadingId(id);
    const res = await fetch("/api/admin/enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        createStudentAccount: status === "approved",
        adminNotes,
      }),
    });
    const data = await res.json();
    if (data.success) {
      playPortalSound(status === "approved" ? "adminApprove" : "adminReject");
      toast.success(data.message ?? "Updated successfully.");
      if (status === "approved" && data.credentials) {
        const enrollment = enrollments.find((item) => item.id === id);
        setApprovedCredentials({
          name: enrollment?.fullName ?? "Student",
          loginId: data.credentials.loginId,
          password: data.credentials.password,
          loginUrl: data.credentials.loginUrl,
        });
      }
      setSelectedIds((current) => current.filter((item) => item !== id));
      await load();
    } else {
      toast.error(data.message ?? data.error ?? "Action failed.");
    }
    setLoadingId(null);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    if (pendingAction.type === "rejected" && !rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    await runAction(
      pendingAction.id,
      pendingAction.type,
      pendingAction.type === "rejected" ? rejectReason.trim() : undefined
    );
    setPendingAction(null);
    setRejectReason("");
  };

  const bulkApprove = async () => {
    const ids = selectedIds.filter((id) => {
      const enrollment = enrollments.find((item) => item.id === id);
      return enrollment?.status === "pending";
    });
    if (ids.length === 0) return;

    setBulkLoading(true);
    const res = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const data = await res.json();
    if (data.success) {
      playPortalSound("adminApprove");
      toast.success(data.message ?? "Bulk approval complete.");
      setSelectedIds([]);
      await load();
    } else {
      toast.error(data.message ?? data.error ?? "Bulk approval failed.");
    }
    setBulkLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoadingId(deleteTarget.id);
    const res = await fetch("/api/admin/enrollments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message ?? "Registration deleted.");
      setSelectedIds((current) => current.filter((item) => item !== deleteTarget.id));
      setDeleteTarget(null);
      await load();
    } else {
      toast.error(data.message ?? data.error ?? "Delete failed.");
    }
    setLoadingId(null);
  };

  return (
    <div>
      <PortalPageHeader
        title="Student Registrations"
        description="Review full application details, payment proof, and approve or reject with student notifications."
      />

      {fetchError && (
        <Alert variant="error" className="mb-4">
          {fetchError}
        </Alert>
      )}

      <div className="mb-6 space-y-4 rounded-2xl border border-border bg-background p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, CNIC, WhatsApp..."
              className="pl-10"
            />
          </div>
          <div className="inline-flex rounded-xl bg-secondary/60 p-1 text-xs sm:text-sm">
            {[
              { value: "all", label: "All courses", count: programCounts.all },
              ...ENROLLABLE_PROGRAM_SLUGS.map((slug) => ({
                value: slug,
                label: getProgramCategory(slug)?.shortLabel ?? slug,
                count: programCounts.perProgram[slug] ?? 0,
              })),
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setProgramFilter(item.value)}
                className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                  programFilter === item.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted hover:text-foreground/90"
                }`}
              >
                {item.label}
                {item.count > 0 ? ` (${item.count})` : ""}
              </button>
            ))}
          </div>
          <Button asChild variant="secondary" className="gap-2 shrink-0">
            <a href={exportUrl} download>
              <DownloadSimple size={18} weight="duotone" />
              Export CSV
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                statusFilter === filter
                  ? "bg-primary text-white"
                  : "bg-secondary text-muted hover:text-foreground"
              }`}
            >
              {filter} {filter === "pending" && pendingCount > 0 ? `(${pendingCount})` : ""}
            </button>
          ))}
        </div>

        {statusFilter === "pending" && pendingFilteredIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={toggleSelectAllPending}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
            >
              <CheckSquare size={18} />
              {allPendingSelected ? "Deselect all" : "Select all pending"}
            </button>
            {selectedIds.length > 0 && (
              <Button
                size="sm"
                className="gap-2"
                disabled={bulkLoading}
                onClick={bulkApprove}
              >
                <CheckCircle size={16} weight="duotone" />
                Approve selected ({selectedIds.length})
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-muted">No registrations match your filters.</p>
        ) : (
          filtered.map((enrollment) => {
            const screenshotUrl = enrollment.paymentScreenshot?.startsWith("http")
              ? enrollment.paymentScreenshot
              : null;
            const isPending = enrollment.status === "pending";

            return (
              <div
                key={enrollment.id}
                className="overflow-hidden rounded-2xl border border-border bg-background"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {isPending && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(enrollment.id)}
                            onChange={() => toggleSelect(enrollment.id)}
                            className="h-4 w-4 rounded border-border"
                            aria-label={`Select ${enrollment.fullName}`}
                          />
                        )}
                        <StatusBadge status={enrollment.status} />
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
                          <CalendarBlank size={14} weight="duotone" className="text-primary" />
                          Applied: {formatAppliedDateTime(enrollment.createdAt)}
                        </span>
                        <button
                          type="button"
                          title="Delete registration"
                          disabled={loadingId === enrollment.id || bulkLoading}
                          onClick={() =>
                            setDeleteTarget({
                              id: enrollment.id,
                              name: enrollment.fullName,
                              status: enrollment.status,
                            })
                          }
                          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash size={16} weight="duotone" />
                          Delete
                        </button>
                      </div>

                      <h2 className="text-xl font-bold">{enrollment.fullName}</h2>
                      <p className="mt-1 text-sm text-muted">Father: {enrollment.fatherName}</p>

                      <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <Field label="Email" value={enrollment.email} />
                        <Field label="WhatsApp" value={enrollment.whatsapp} />
                        <Field label="CNIC" value={enrollment.cnic} mono />
                        <Field label="Institution" value={enrollment.institution} />
                        <Field label="Class / Semester" value={enrollment.classSemester} />
                        <Field label="Field of Study" value={enrollment.fieldOfStudy} />
                        <Field label="Course" value={enrollment.courseTitle} />
                        <Field label="Module" value={enrollment.level} />
                        <Field label="Batch" value={enrollment.batch} />
                        <Field label="Learning Mode" value={enrollment.learningMode} />
                        <Field label="Laptop" value={enrollment.hasLaptop} />
                        <Field label="Internet" value={enrollment.internetAvailable} />
                        <Field label="Applied On" value={formatAppliedDate(enrollment.createdAt)} />
                        <Field label="Applied At" value={formatAppliedTime(enrollment.createdAt)} />
                        {enrollment.reviewedAt && enrollment.status !== "pending" && (
                          <>
                            <Field
                              label="Reviewed"
                              value={formatAppliedDateTime(enrollment.reviewedAt)}
                            />
                            <Field
                              label="Reviewed By"
                              value={enrollment.reviewerName ?? "Admin"}
                            />
                          </>
                        )}
                        {enrollment.adminNotes && (
                          <div className="sm:col-span-2 rounded-xl bg-surface p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                              Admin Notes
                            </p>
                            <p className="mt-1">{enrollment.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {screenshotUrl && (
                      <div className="shrink-0">
                        <p className="mb-2 text-sm font-semibold">Payment Screenshot</p>
                        <a
                          href={screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative block h-52 w-40 overflow-hidden rounded-xl border-2 border-border transition-colors hover:border-primary"
                        >
                          <Image
                            src={screenshotUrl}
                            alt="Payment"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </a>
                        <p className="mt-1 text-xs text-muted">Tap to enlarge</p>
                      </div>
                    )}
                  </div>

                  {isPending && (
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-5">
                      <Button
                        size="lg"
                        className="gap-2"
                        disabled={loadingId === enrollment.id || bulkLoading}
                        onClick={() =>
                          setPendingAction({
                            id: enrollment.id,
                            type: "approved",
                            name: enrollment.fullName,
                          })
                        }
                      >
                        <CheckCircle size={20} weight="duotone" />
                        Approve &amp; Create Account
                      </Button>
                      <Button
                        size="lg"
                        variant="secondary"
                        className="gap-2 text-red-600 hover:text-red-700"
                        disabled={loadingId === enrollment.id || bulkLoading}
                        onClick={() =>
                          setPendingAction({
                            id: enrollment.id,
                            type: "rejected",
                            name: enrollment.fullName,
                          })
                        }
                      >
                        <XCircle size={20} weight="duotone" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {!isPending && (
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-5">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={loadingId === enrollment.id || bulkLoading}
                        onClick={() =>
                          setDeleteTarget({
                            id: enrollment.id,
                            name: enrollment.fullName,
                            status: enrollment.status,
                          })
                        }
                      >
                        <Trash size={20} weight="duotone" />
                        Delete Registration
                      </Button>
                      {enrollment.status === "approved" && (
                        <p className="w-full text-xs text-muted">
                          Removes this registration
                          {enrollment.email ? " and portal account if no other approved registration exists for this email" : ""}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        open={Boolean(pendingAction)}
        onClose={() => {
          setPendingAction(null);
          setRejectReason("");
        }}
        title={
          pendingAction?.type === "approved"
            ? "Confirm Approval"
            : "Confirm Rejection"
        }
      >
        {pendingAction?.type === "approved" ? (
          <>
            <p className="text-sm text-muted">
              Approve <strong>{pendingAction.name}</strong> and create their student account?
              Login details will be sent by email and WhatsApp.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPendingAction(null)}>
                Cancel
              </Button>
              <Button disabled={loadingId === pendingAction.id} onClick={confirmAction}>
                Yes, Approve
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              Reject <strong>{pendingAction?.name}</strong>? The student will be notified by
              email and WhatsApp with your reason.
            </p>
            <label className="mt-4 block text-sm font-medium">
              Rejection reason
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="e.g. Payment screenshot unclear, wrong amount, duplicate registration..."
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setPendingAction(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="text-red-600"
                disabled={loadingId === pendingAction?.id}
                onClick={confirmAction}
              >
                Reject Registration
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Registration"
      >
        {deleteTarget && (
          <>
            <p className="text-sm text-muted">
              Permanently delete <strong>{deleteTarget.name}</strong>&apos;s registration?
            </p>
            {deleteTarget.status === "approved" && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                This will also remove their student portal account, login access, and assignment
                submissions. This cannot be undone.
              </p>
            )}
            {deleteTarget.status !== "approved" && (
              <p className="mt-3 text-sm text-muted">
                Payment screenshot and application data will be permanently removed.
              </p>
            )}
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

      <Modal
        open={Boolean(approvedCredentials)}
        onClose={() => setApprovedCredentials(null)}
        title="Portal Login Saved"
      >
        {approvedCredentials && (
          <>
            <p className="text-sm text-muted">
              Login saved for <strong>{approvedCredentials.name}</strong>. You can also find this
              anytime under <strong>Portal Logins</strong> in the sidebar.
            </p>
            <div className="mt-4 rounded-xl border border-border bg-surface p-4 space-y-2 text-sm">
              <p>
                <span className="text-muted">Login ID:</span>{" "}
                <strong className="font-mono">{approvedCredentials.loginId}</strong>
              </p>
              <p>
                <span className="text-muted">Password:</span>{" "}
                <strong className="font-mono">{approvedCredentials.password}</strong>
              </p>
              <p>
                <span className="text-muted">Portal:</span>{" "}
                <a href={approvedCredentials.loginUrl} className="text-primary underline">
                  {approvedCredentials.loginUrl}
                </a>
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                className="gap-2"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `Login ID: ${approvedCredentials.loginId}\nPassword: ${approvedCredentials.password}\nPortal: ${approvedCredentials.loginUrl}`
                    );
                    toast.success("Login details copied");
                  } catch {
                    toast.error("Could not copy");
                  }
                }}
              >
                <Copy size={16} />
                Copy Login
              </Button>
              <Button onClick={() => setApprovedCredentials(null)}>Done</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <p>
      <strong>{label}:</strong>{" "}
      <span className={mono ? "font-mono text-xs" : undefined}>{value}</span>
    </p>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };
  const icons = { pending: Clock, approved: CheckCircle, rejected: XCircle };
  const Icon = icons[status as keyof typeof icons] ?? Clock;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
        styles[status as keyof typeof styles] ?? styles.pending
      }`}
    >
      <Icon size={14} weight="duotone" />
      {status}
    </span>
  );
}
