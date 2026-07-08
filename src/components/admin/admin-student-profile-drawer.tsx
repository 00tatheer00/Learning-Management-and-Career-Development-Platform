"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  X,
  Copy,
  Eye,
  EyeSlash,
  ChatsCircle,
  Key,
  ClipboardText,
  ListChecks,
  UserCircle,
  ArrowClockwise,
  ArrowSquareOut,
  GraduationCap,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAdminPermissions } from "@/components/admin/admin-permissions";
import type { AdminStudentProfile } from "@/lib/api/admin-student-profile";
import { paymentScreenshotHref, revealEnrollmentPassword, revealStudentPassword } from "@/lib/api/admin-client";
import { cn, formatAppliedDateTime } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";

export type StudentProfileTarget =
  | { studentId: string }
  | { email: string }
  | { enrollmentId: string };

interface AdminStudentProfileContextValue {
  open: boolean;
  loading: boolean;
  profile: AdminStudentProfile | null;
  target: StudentProfileTarget | null;
  openProfile: (target: StudentProfileTarget) => void;
  closeProfile: () => void;
  refreshProfile: () => Promise<void>;
}

const AdminStudentProfileContext = createContext<AdminStudentProfileContextValue | null>(null);

function buildProfileUrl(target: StudentProfileTarget) {
  const params = new URLSearchParams();
  if ("enrollmentId" in target && target.enrollmentId.trim()) {
    params.set("enrollmentId", target.enrollmentId.trim());
    return `/api/admin/students/profile?${params.toString()}`;
  }
  if ("studentId" in target && target.studentId.trim()) {
    params.set("studentId", target.studentId.trim());
  }
  if ("email" in target && target.email.trim()) {
    params.set("email", target.email.trim());
  }
  return `/api/admin/students/profile?${params.toString()}`;
}

function isValidProfileTarget(target: StudentProfileTarget) {
  if ("enrollmentId" in target) return Boolean(target.enrollmentId.trim());
  if ("studentId" in target) return Boolean(target.studentId.trim());
  if ("email" in target) return Boolean(target.email.trim());
  return false;
}

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Could not copy");
  }
}

export function AdminStudentProfileProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<AdminStudentProfile | null>(null);
  const [target, setTarget] = useState<StudentProfileTarget | null>(null);

  const loadProfile = useCallback(async (nextTarget: StudentProfileTarget) => {
    setLoading(true);
    try {
      const res = await fetch(buildProfileUrl(nextTarget), { cache: "no-store", credentials: "same-origin" });
      const json = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
      } else {
        toast.error(json.error ?? "Could not load student profile");
        setOpen(false);
      }
    } catch {
      toast.error("Could not load student profile");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const openProfile = useCallback(
    (nextTarget: StudentProfileTarget) => {
      if (!isValidProfileTarget(nextTarget)) {
        toast.error("Could not open student profile");
        return;
      }
      setTarget(nextTarget);
      setProfile(null);
      setOpen(true);
      void loadProfile(nextTarget);
    },
    [loadProfile]
  );

  const closeProfile = useCallback(() => {
    setOpen(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!target) return;
    await loadProfile(target);
  }, [loadProfile, target]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProfile();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, closeProfile]);

  const value = useMemo(
    () => ({ open, loading, profile, target, openProfile, closeProfile, refreshProfile }),
    [open, loading, profile, target, openProfile, closeProfile, refreshProfile]
  );

  return (
    <AdminStudentProfileContext.Provider value={value}>
      {children}
      <AdminStudentProfileDrawer />
    </AdminStudentProfileContext.Provider>
  );
}

export function useAdminStudentProfile() {
  const ctx = useContext(AdminStudentProfileContext);
  if (!ctx) {
    throw new Error("useAdminStudentProfile must be used within AdminStudentProfileProvider");
  }
  return ctx;
}

export function useAdminStudentProfileOptional() {
  return useContext(AdminStudentProfileContext);
}

export function OpenStudentProfileButton({
  target,
  children,
  className,
}: {
  target: StudentProfileTarget;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useAdminStudentProfileOptional();
  if (!ctx) return <>{children}</>;

  return (
    <button
      type="button"
      onClick={() => ctx.openProfile(target)}
      title="View student profile"
      className={cn(
        "cursor-pointer text-left transition-colors hover:text-primary",
        className
      )}
    >
      {children}
    </button>
  );
}

export function AdminStudentProfileButton({
  target,
  compact = false,
  className,
}: {
  target: StudentProfileTarget;
  compact?: boolean;
  className?: string;
}) {
  const ctx = useAdminStudentProfileOptional();
  if (!ctx) return null;

  return (
    <button
      type="button"
      onClick={() => ctx.openProfile(target)}
      title="View student profile"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-pt font-semibold text-pt-secondary transition-colors hover:border-primary/40 hover:bg-pt-muted hover:text-primary",
        compact ? "p-2 text-xs" : "px-3 py-2 text-xs",
        className
      )}
    >
      <UserCircle size={compact ? 16 : 17} weight="duotone" />
      {!compact && "Profile"}
    </button>
  );
}

function AdminStudentProfileDrawer() {
  const { open, loading, profile, target, closeProfile, refreshProfile } = useAdminStudentProfile();
  const { canWrite } = useAdminPermissions();
  const [showPassword, setShowPassword] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setShowPassword(false);
    setRevealedPassword(null);
  }, [profile?.studentId]);

  if (!open) return null;

  const runStudentAction = async (
    action: "resetPassword" | "activate" | "deactivate",
    label: string
  ) => {
    if (!profile?.studentId) return;
    setActionLoading(action);
    try {
      const body: Record<string, string> = { id: profile.studentId, action };
      if (action === "resetPassword" && profile.focusedEnrollmentId) {
        body.enrollmentId = profile.focusedEnrollmentId;
      }

      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? `${label} done.`);
        if (action === "resetPassword") {
          const password = json.data?.password as string | undefined;
          if (password) {
            setRevealedPassword(password);
            setShowPassword(true);
          }
        }
        await refreshProfile();
      } else {
        toast.error(json.message ?? json.error ?? `${label} failed`);
      }
    } catch {
      toast.error(`${label} failed`);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleRevealPassword = async () => {
    if (showPassword) {
      setShowPassword(false);
      return;
    }

    if (!profile?.studentId && !profile?.focusedEnrollmentId) return;

    if (!revealedPassword) {
      setActionLoading("password");
      const enrollmentId =
        profile.focusedEnrollmentId ??
        (target && "enrollmentId" in target ? target.enrollmentId : undefined);
      const result = enrollmentId
        ? await revealEnrollmentPassword(enrollmentId)
        : profile.studentId
          ? await revealStudentPassword(profile.studentId)
          : { password: null as string | null, error: "Could not load password" };
      setActionLoading(null);
      if (!result.password) {
        toast.error(result.error ?? "Could not load password");
        return;
      }
      setRevealedPassword(result.password);
    }

    setShowPassword(true);
  };

  const resendWhatsApp = async () => {
    if (!profile?.studentId && !profile?.focusedEnrollmentId) return;
    setActionLoading("whatsapp");
    try {
      const body = profile.focusedEnrollmentId
        ? { action: "resendLogin", enrollmentId: profile.focusedEnrollmentId }
        : profile.studentId
          ? { action: "resendLogin", studentId: profile.studentId }
          : null;

      if (!body) return;

      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "WhatsApp sent.");
      } else {
        toast.error(json.error ?? json.message ?? "WhatsApp send failed");
      }
    } catch {
      toast.error("WhatsApp send failed");
    } finally {
      setActionLoading(null);
    }
  };

  const initials = (profile?.name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        aria-label="Close student profile"
        className="absolute inset-0 bg-pt-overlay backdrop-blur-[2px]"
        onClick={closeProfile}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Student profile"
        className="relative flex h-full w-full max-w-md flex-col border-l border-pt bg-pt-surface shadow-pt-md"
      >
        <div className="shrink-0 border-b border-pt px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-pt-faint">
                  Student profile
                </p>
                <h2 className="text-lg font-bold text-pt truncate">
                  {loading ? "Loading…" : profile?.name}
                </h2>
                {profile?.course && (
                  <p className="text-xs text-pt-muted mt-0.5 truncate">
                    {profile.course}
                    {profile.module ? ` · ${profile.module}` : ""}
                    {profile.batch ? ` · ${profile.batch}` : ""}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={closeProfile}
              className="rounded-lg p-2 text-pt-muted hover:bg-pt-muted hover:text-pt"
              aria-label="Close"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          {profile && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.hasPortalAccount ? (
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
                    profile.isActive ? "portal-status-approved" : "portal-status-rejected"
                  )}
                >
                  {profile.isActive ? "Active account" : "Inactive"}
                </span>
              ) : (
                <span className="inline-flex rounded-full portal-tag-amber px-2.5 py-0.5 text-[10px] font-semibold">
                  No portal account
                </span>
              )}
              {profile.firstLoginAt ? (
                <span className="inline-flex rounded-full portal-stat-chip-emerald px-2.5 py-0.5 text-[10px] font-semibold border">
                  Logged in
                </span>
              ) : profile.hasPortalAccount ? (
                <span className="inline-flex rounded-full portal-tag-amber px-2.5 py-0.5 text-[10px] font-semibold">
                  Never logged in
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading && !profile && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl portal-skeleton animate-pulse" />
              ))}
            </div>
          )}

          {profile && (
            <>
              <section>
                <SectionTitle icon={<UserCircle size={16} weight="duotone" />} title="Contact" />
                <div className="mt-2 space-y-2">
                  <CopyRow label="Email" value={profile.email} />
                  <CopyRow label="WhatsApp" value={profile.whatsapp} />
                  {profile.cnic && <CopyRow label="CNIC" value={profile.cnic} mono />}
                  {profile.fatherName && (
                    <InfoRow label="Father" value={profile.fatherName} />
                  )}
                  {profile.institution && (
                    <InfoRow label="Institution" value={profile.institution} />
                  )}
                </div>
              </section>

              <section>
                <SectionTitle icon={<Key size={16} weight="duotone" />} title="Portal login" />
                <div className="mt-2 portal-card-muted rounded-xl p-3.5 space-y-2.5">
                  {!profile.hasPortalAccount ? (
                    <p className="text-sm text-pt-muted">
                      Portal account not created yet. Approve a registration first.
                    </p>
                  ) : (
                    <>
                      <CopyRow label="Login ID" value={profile.email} />
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-pt-faint">
                            Password
                          </p>
                          <p className="font-mono text-sm text-pt truncate">
                            {profile.hasStoredPassword
                              ? showPassword
                                ? revealedPassword ?? "…"
                                : "••••••••"
                              : "Not saved"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {profile.hasStoredPassword && (
                            <>
                              <button
                                type="button"
                                onClick={() => void toggleRevealPassword()}
                                disabled={actionLoading === "password"}
                                className="rounded-lg p-2 hover:bg-pt-muted text-pt-muted"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                              </button>
                              <button
                                type="button"
                                disabled={!revealedPassword}
                                onClick={() => void copyText("Password", revealedPassword ?? "")}
                                className="rounded-lg p-2 hover:bg-pt-muted text-pt-muted disabled:opacity-40"
                                aria-label="Copy password"
                              >
                                <Copy size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <CopyRow label="Portal URL" value={profile.loginUrl} />
                      {profile.firstLoginAt && (
                        <InfoRow
                          label="First login"
                          value={formatAppliedDateTime(profile.firstLoginAt)}
                        />
                      )}
                      {profile.lastLoginAt && (
                        <InfoRow
                          label="Last login"
                          value={formatAppliedDateTime(profile.lastLoginAt)}
                        />
                      )}
                      {canWrite && profile.studentId && profile.hasStoredPassword && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full gap-2 mt-1"
                          disabled={actionLoading === "whatsapp"}
                          onClick={() => void resendWhatsApp()}
                        >
                          <ChatsCircle size={16} weight="duotone" />
                          {actionLoading === "whatsapp" ? "Sending…" : "Resend login on WhatsApp"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </section>

              {profile.trainer && (
                <section>
                  <SectionTitle
                    icon={<GraduationCap size={16} weight="duotone" />}
                    title="Trainer"
                  />
                  <div className="mt-2 portal-card-muted rounded-xl p-3.5">
                    <p className="font-semibold text-pt">{profile.trainer.name}</p>
                    <p className="text-sm text-pt-muted mt-0.5">{profile.trainer.email}</p>
                  </div>
                </section>
              )}

              <section>
                <SectionTitle
                  icon={<ClipboardText size={16} weight="duotone" />}
                  title={`Registrations (${profile.enrollments.length})`}
                />
                <div className="mt-2 space-y-2">
                  {profile.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="portal-card-muted rounded-xl p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-pt">{enrollment.courseTitle}</p>
                          <p className="text-xs text-pt-muted mt-0.5">
                            {enrollment.level} · {enrollment.batch}
                          </p>
                        </div>
                        <EnrollmentStatusBadge status={enrollment.status} />
                      </div>
                      <p className="text-[11px] text-pt-muted mt-2">
                        Applied {formatAppliedDateTime(enrollment.createdAt)}
                        {enrollment.applicationNumber > 1 &&
                          ` · ${enrollment.applicationNumber}${enrollment.applicationNumber === 2 ? "nd" : enrollment.applicationNumber === 3 ? "rd" : "th"} application`}
                      </p>
                      {enrollment.reviewedAt && (
                        <p className="text-[11px] text-pt-muted">
                          Reviewed {formatAppliedDateTime(enrollment.reviewedAt)}
                          {enrollment.reviewerName ? ` by ${enrollment.reviewerName}` : ""}
                        </p>
                      )}
                      {enrollment.adminNotes && (
                        <p className="text-xs text-pt-secondary mt-2 rounded-lg bg-pt-muted px-2.5 py-2">
                          {enrollment.adminNotes}
                        </p>
                      )}
                      {enrollment.hasPaymentScreenshot && (
                        <a
                          href={paymentScreenshotHref(enrollment.id, "redirect")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2 hover:underline"
                        >
                          View payment screenshot
                          <ArrowSquareOut size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle
                  icon={<ListChecks size={16} weight="duotone" />}
                  title="Class attendance"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="portal-stat-chip-emerald inline-flex rounded-lg border px-2.5 py-1 text-xs">
                    <span className="opacity-70 mr-1">Present</span>
                    <span className="font-bold">{profile.attendance.present}</span>
                  </span>
                  <span className="portal-stat-chip-amber inline-flex rounded-lg border px-2.5 py-1 text-xs">
                    <span className="opacity-70 mr-1">Late</span>
                    <span className="font-bold">{profile.attendance.late}</span>
                  </span>
                  <span className="portal-stat-chip inline-flex rounded-lg border px-2.5 py-1 text-xs">
                    <span className="opacity-70 mr-1">Total joins</span>
                    <span className="font-bold">{profile.attendance.total}</span>
                  </span>
                </div>
                {profile.attendance.recent.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {profile.attendance.recent.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-pt-subtle px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-pt truncate">{row.sessionTitle}</p>
                          <p className="text-pt-muted">
                            {row.sessionDate} · {row.sessionTime}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 font-semibold capitalize",
                            row.status === "present"
                              ? "portal-status-approved"
                              : "portal-status-pending"
                          )}
                        >
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-pt-muted mt-2">
                    {profile.hasPortalAccount
                      ? "No class joins recorded yet."
                      : "Attendance appears after portal account is created."}
                  </p>
                )}
              </section>
            </>
          )}
        </div>

        {profile && canWrite && profile.studentId && (
          <div className="shrink-0 border-t border-pt px-5 py-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5"
              disabled={Boolean(actionLoading)}
              onClick={() => void runStudentAction("resetPassword", "Password reset")}
            >
              <ArrowClockwise size={15} />
              Reset password
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-pt"
              disabled={Boolean(actionLoading)}
              onClick={() =>
                void runStudentAction(
                  profile.isActive ? "deactivate" : "activate",
                  profile.isActive ? "Deactivation" : "Activation"
                )
              }
            >
              {profile.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button size="sm" variant="ghost" asChild className="ml-auto">
              <Link href="/admin/students" onClick={closeProfile}>
                Open students
              </Link>
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <h3 className="text-xs font-bold uppercase tracking-widest text-pt-faint">{title}</h3>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-pt-faint">{label}</p>
      <p className="text-sm text-pt mt-0.5">{value}</p>
    </div>
  );
}

function CopyRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-pt-faint">{label}</p>
        <p className={cn("text-sm text-pt mt-0.5 break-all", mono && "font-mono text-xs")}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void copyText(label, value)}
        className="shrink-0 rounded-lg p-2 hover:bg-pt-muted text-pt-muted"
        aria-label={`Copy ${label}`}
      >
        <Copy size={15} />
      </button>
    </div>
  );
}

function EnrollmentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "portal-status-pending",
    approved: "portal-status-approved",
    rejected: "portal-status-rejected",
  };
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
        styles[status] ?? styles.pending
      )}
    >
      {status}
    </span>
  );
}
