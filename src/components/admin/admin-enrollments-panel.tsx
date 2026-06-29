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
  ChatsCircle,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { ADMIN_REJECT_PRESETS } from "@/lib/constants/admin-reject-reasons";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { formatAppliedDate, formatAppliedDateTime, formatAppliedTime, cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import { playPortalSound, primePortalSounds } from "@/lib/ui/portal-sounds";
import { Alert } from "@/components/ui/alert";
import { useAdminPermissions } from "@/components/admin/admin-permissions";
import { OpenStudentProfileButton } from "@/components/admin/admin-student-profile-drawer";
import type { AdminEnrollmentRow } from "@/lib/api/admin-enrollments";

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type QuickFilter = "all" | "today" | "returning" | "duplicates" | "whatsapp-failed" | "no-payment";
type PendingAction = { id: string; type: "approved" | "rejected"; name: string };

function isCreatedToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function hasPaymentScreenshot(url?: string | null): boolean {
  return Boolean(url?.startsWith("http"));
}

export function AdminEnrollmentsPanel() {
  const { canWrite } = useAdminPermissions();
  const [enrollments, setEnrollments] = useState<AdminEnrollmentRow[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
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
    studentId?: string;
    whatsappSent?: boolean;
    whatsappError?: string;
  } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [zoomScreenshot, setZoomScreenshot] = useState<{ url: string; caption: string } | null>(
    null
  );
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

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
      if (quickFilter === "today" && !isCreatedToday(enrollment.createdAt)) return false;
      if (quickFilter === "returning" && !enrollment.isReturningApplicant) return false;
      if (quickFilter === "duplicates" && !enrollment.duplicateMatch) return false;
      if (
        quickFilter === "whatsapp-failed" &&
        !(enrollment.status === "approved" && enrollment.approvalWhatsAppSent === false)
      ) {
        return false;
      }
      if (quickFilter === "no-payment" && hasPaymentScreenshot(enrollment.paymentScreenshot)) {
        return false;
      }
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
  }, [enrollments, statusFilter, programFilter, quickFilter, search]);

  const pendingSelectedCount = selectedIds.filter((id) => {
    const enrollment = enrollments.find((item) => item.id === id);
    return enrollment?.status === "pending";
  }).length;
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
    try {
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

      let data: {
        success?: boolean;
        message?: string;
        error?: string;
        credentials?: {
          loginId: string;
          password: string;
          loginUrl: string;
        };
        notification?: {
          whatsappSent?: boolean;
          whatsappError?: string;
          studentId?: string;
        };
      } = {};

      try {
        data = await res.json();
      } catch {
        toast.error("Server response error", "Please refresh the page to confirm status.");
        return;
      }

      if (!data.success) {
        toast.error(data.message ?? data.error ?? "Action failed.");
        return;
      }

      playPortalSound(status === "approved" ? "adminApprove" : "adminReject");
      if (status === "approved" && data.notification?.whatsappSent) {
        toast.success("Approved", data.message ?? "WhatsApp sent to student.");
      } else if (status === "approved" && data.notification?.whatsappSent === false) {
        toast.error("Approved but WhatsApp failed", data.notification.whatsappError ?? data.message);
      } else {
        toast.success(data.message ?? "Updated successfully.");
      }

      if (status === "approved" && data.credentials) {
        const enrollment = enrollments.find((item) => item.id === id);
        setApprovedCredentials({
          name: enrollment?.fullName ?? "Student",
          loginId: data.credentials.loginId,
          password: data.credentials.password,
          loginUrl: data.credentials.loginUrl,
          studentId: data.notification?.studentId,
          whatsappSent: data.notification?.whatsappSent,
          whatsappError: data.notification?.whatsappError,
        });
      }

      setEnrollments((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                reviewedAt: new Date().toISOString(),
              }
            : item
        )
      );
      setSelectedIds((current) => current.filter((item) => item !== id));
      void load();
    } catch {
      toast.error("Action failed", "Check your connection and refresh if needed.");
    } finally {
      setLoadingId(null);
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    if (pendingAction.type === "rejected" && !rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    primePortalSounds();
    try {
      await runAction(
        pendingAction.id,
        pendingAction.type,
        pendingAction.type === "rejected" ? rejectReason.trim() : undefined
      );
    } finally {
      setPendingAction(null);
      setRejectReason("");
    }
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
      setBulkConfirmOpen(false);
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
          <div className="overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1">
          <div className="inline-flex rounded-xl bg-secondary/60 p-1 text-xs sm:text-sm min-w-max">
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
          </div>
          <Button asChild variant="secondary" className="gap-2 shrink-0">
            <a href={exportUrl} download>
              <DownloadSimple size={18} weight="duotone" />
              Export CSV
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "all", label: "All" },
              { value: "today", label: "Today" },
              { value: "returning", label: "Returning" },
              { value: "duplicates", label: "Duplicate CNIC/Email" },
              { value: "whatsapp-failed", label: "WhatsApp failed" },
              { value: "no-payment", label: "No payment SS" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setQuickFilter(item.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                quickFilter === item.value
                  ? "bg-slate-800 text-white"
                  : "border border-border bg-background text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
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

        {canWrite && statusFilter === "pending" && pendingFilteredIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={toggleSelectAllPending}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
            >
              <CheckSquare size={18} />
              {allPendingSelected ? "Deselect all" : "Select all pending"}
            </button>
            {pendingSelectedCount > 0 && (
              <Button
                size="sm"
                className="gap-2"
                disabled={bulkLoading}
                onClick={() => setBulkConfirmOpen(true)}
              >
                <CheckCircle size={16} weight="duotone" />
                Approve selected ({pendingSelectedCount})
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
                className={cn(
                  "overflow-hidden rounded-2xl border bg-background",
                  enrollment.duplicateMatch?.hasApprovedMatch
                    ? "border-violet-300 ring-1 ring-violet-100"
                    : enrollment.duplicateMatch?.hasPendingMatch
                      ? "border-amber-300 ring-1 ring-amber-100"
                      : "border-border"
                )}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {canWrite && isPending && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(enrollment.id)}
                            onChange={() => toggleSelect(enrollment.id)}
                            className="h-4 w-4 rounded border-border"
                            aria-label={`Select ${enrollment.fullName}`}
                          />
                        )}
                        <StatusBadge status={enrollment.status} />
                        {enrollment.applicationNumber > 1 && (
                          <span className="inline-flex items-center rounded-full portal-tag-amber px-3 py-1 text-xs font-bold">
                            {enrollment.applicationNumber}
                            {enrollment.applicationNumber === 2
                              ? "nd"
                              : enrollment.applicationNumber === 3
                                ? "rd"
                                : "th"}{" "}
                            Application
                          </span>
                        )}
                        {enrollment.isReturningApplicant && (
                          <span className="inline-flex items-center rounded-full portal-tag-violet px-3 py-1 text-xs font-semibold">
                            Returning Student
                          </span>
                        )}
                        {enrollment.duplicateMatch && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                              enrollment.duplicateMatch.hasApprovedMatch
                                ? "portal-tag-violet"
                                : "portal-tag-amber"
                            )}
                            title={enrollment.duplicateMatch.label}
                          >
                            {enrollment.duplicateMatch.field === "both"
                              ? "Same Email & CNIC"
                              : enrollment.duplicateMatch.field === "email"
                                ? "Same Email"
                                : "Same CNIC"}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
                          <CalendarBlank size={14} weight="duotone" className="text-primary" />
                          Applied: {formatAppliedDateTime(enrollment.createdAt)}
                        </span>
                        {canWrite && (
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
                        )}
                      </div>

                      <OpenStudentProfileButton
                        target={{ enrollmentId: enrollment.id }}
                        className="text-xl font-bold hover:underline"
                      >
                        {enrollment.fullName}
                      </OpenStudentProfileButton>
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
                        {enrollment.previousApplications.length > 0 && (
                          <div className="sm:col-span-2 rounded-xl portal-callout-amber-subtle p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                              Previous Applications ({enrollment.totalApplications - 1})
                            </p>
                            <p className="mt-1 text-sm opacity-90">
                              Returning student — confirm this is a <strong>new PKR 1,000</strong>{" "}
                              payment screenshot before approving.
                            </p>
                            <ul className="mt-3 space-y-2">
                              {enrollment.previousApplications.map((prev) => (
                                <li
                                  key={prev.id}
                                  className="flex flex-wrap items-center gap-2 rounded-lg portal-callout-item px-3 py-2 text-sm"
                                >
                                  <span className="font-medium">{prev.courseTitle}</span>
                                  <span className="text-muted">({prev.level})</span>
                                  <span className="capitalize rounded-full bg-surface px-2 py-0.5 text-xs font-semibold">
                                    {prev.status}
                                  </span>
                                  <span className="text-xs text-muted">
                                    {formatAppliedDateTime(prev.appliedAt)}
                                  </span>
                                  {prev.paymentScreenshot?.startsWith("http") && (
                                    <a
                                      href={prev.paymentScreenshot}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold text-primary underline"
                                    >
                                      View payment SS
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {screenshotUrl && (
                      <div className="shrink-0">
                        <p className="mb-2 text-sm font-semibold">Payment Screenshot</p>
                        <button
                          type="button"
                          onClick={() =>
                            setZoomScreenshot({
                              url: screenshotUrl,
                              caption: `${enrollment.fullName} — payment proof`,
                            })
                          }
                          className="group relative block h-52 w-40 overflow-hidden rounded-xl border-2 border-border transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <Image
                            src={screenshotUrl}
                            alt="Payment"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/60 py-2 text-xs font-semibold text-white">
                            <MagnifyingGlass size={14} weight="bold" />
                            Zoom
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {canWrite && isPending && (
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

                  {canWrite && !isPending && (
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

      <ImageLightbox
        open={Boolean(zoomScreenshot)}
        onClose={() => setZoomScreenshot(null)}
        src={zoomScreenshot?.url ?? ""}
        alt="Payment screenshot"
        caption={zoomScreenshot?.caption}
      />

      <Modal
        open={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        title="Bulk Approve Registrations"
      >
        <p className="text-sm text-muted">
          Approve <strong>{pendingSelectedCount}</strong> pending registration
          {pendingSelectedCount === 1 ? "" : "s"}? Each student gets a portal account, password
          saved under Portal Logins, and WhatsApp notification sent.
        </p>
        <p className="mt-3 text-sm rounded-xl portal-callout-amber px-3 py-2">
          Review payment screenshots first — especially returning students with a 2nd application.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setBulkConfirmOpen(false)}>
            Cancel
          </Button>
          <Button disabled={bulkLoading} className="gap-2" onClick={() => void bulkApprove()}>
            <CheckCircle size={18} weight="duotone" />
            {bulkLoading ? "Approving…" : `Approve ${pendingSelectedCount}`}
          </Button>
        </div>
      </Modal>

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
              Login details will be saved in Portal Logins and sent on WhatsApp.
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
              Reject <strong>{pendingAction?.name}</strong>? The student will be notified on
              WhatsApp with your reason.
            </p>
            <label className="mt-4 block text-sm font-medium">
              Rejection reason
              <div className="mt-2 flex flex-wrap gap-2">
                {ADMIN_REJECT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setRejectReason(preset.message)}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/5"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Or type your own custom message..."
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

            <div
              className={cn(
                "mt-4 rounded-xl p-4 text-sm",
                approvedCredentials.whatsappSent
                  ? "portal-callout-success"
                  : "portal-callout-error"
              )}
            >
              <p className="font-semibold flex items-center gap-2">
                <ChatsCircle size={18} weight="duotone" />
                {approvedCredentials.whatsappSent
                  ? "WhatsApp sent to student"
                  : "WhatsApp failed to send"}
              </p>
              {!approvedCredentials.whatsappSent && approvedCredentials.whatsappError && (
                <p className="mt-1 text-xs opacity-90">{approvedCredentials.whatsappError}</p>
              )}
            </div>

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
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {!approvedCredentials.whatsappSent && approvedCredentials.studentId && (
                <Button
                  variant="secondary"
                  className="gap-2"
                  disabled={resendLoading}
                  onClick={async () => {
                    if (!approvedCredentials.studentId) return;
                    setResendLoading(true);
                    try {
                      const res = await fetch("/api/admin/whatsapp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "resendLogin",
                          studentId: approvedCredentials.studentId,
                        }),
                      });
                      const json = await res.json();
                      if (json.success) {
                        toast.success(json.message ?? "WhatsApp resent.");
                        setApprovedCredentials((current) =>
                          current
                            ? { ...current, whatsappSent: true, whatsappError: undefined }
                            : current
                        );
                        void load();
                      } else {
                        toast.error(json.error ?? json.message ?? "Resend failed");
                      }
                    } catch {
                      toast.error("Resend failed");
                    } finally {
                      setResendLoading(false);
                    }
                  }}
                >
                  <ArrowCounterClockwise size={16} />
                  {resendLoading ? "Sending..." : "Resend WhatsApp"}
                </Button>
              )}
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
    pending: "portal-status-pending",
    approved: "portal-status-approved",
    rejected: "portal-status-rejected",
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
