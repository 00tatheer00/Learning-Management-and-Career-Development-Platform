"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  EyeSlash,
  Key,
  MagnifyingGlass,
  ArrowClockwise,
  ChatsCircle,
  EnvelopeSimple,
  PencilSimple,
  Warning,
  Wrench,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { getProgramBySlug } from "@/lib/data/programs";
import { buildStudentLoginWhatsAppMessage } from "@/lib/notifications/approval-templates";
import { cn, formatAppliedDateTime } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { PORTAL_VIEWPORT_PANEL } from "@/lib/constants/portal-layout";
import { toast } from "@/lib/ui/toast";
import { useAdminPermissions } from "@/components/admin/admin-permissions";
import { OpenStudentProfileButton, AdminStudentProfileButton } from "@/components/admin/admin-student-profile-drawer";
import type { AdminCredentialRow } from "@/lib/api/admin-credentials";
import { revealEnrollmentPassword } from "@/lib/api/admin-client";
import {
  getWhatsAppDirectLink,
  buildApprovalWhatsAppMessage,
  isDummyPhoneNumber,
} from "@/lib/utils/whatsapp-direct";

interface CredentialsMeta {
  total: number;
  saved: number;
  missing: number;
  loggedIn: number;
  neverLoggedIn: number;
}

async function copyText(label: string, value: string) {
  const copied = await copyToClipboard(value);
  if (copied) {
    toast.success(`${label} copied`);
  } else {
    toast.error("Could not copy");
  }
}

export function AdminCredentialsPanel() {
  const { canWrite } = useAdminPermissions();
  const [rows, setRows] = useState<AdminCredentialRow[]>([]);
  const [meta, setMeta] = useState<CredentialsMeta>({
    total: 0,
    saved: 0,
    missing: 0,
    loggedIn: 0,
    neverLoggedIn: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [showNeverLoggedInOnly, setShowNeverLoggedInOnly] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [syncingLogins, setSyncingLogins] = useState(false);
  const [resettingAll, setResettingAll] = useState(false);
  const [emailingAll, setEmailingAll] = useState(false);
  const [fixingEmails, setFixingEmails] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [confirmEmailAll, setConfirmEmailAll] = useState(false);
  const [credentialModal, setCredentialModal] = useState<{
    name: string;
    loginId: string;
    password: string;
    loginUrl: string;
    course: string;
    module: string;
    programSlug: string;
  } | null>(null);
  const [editRow, setEditRow] = useState<AdminCredentialRow | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/credentials", { cache: "no-store", credentials: "same-origin" });
      const json = await res.json();
      if (json.success) {
        setRows(json.data?.rows ?? []);
        setMeta(json.data?.meta ?? { total: 0, saved: 0, missing: 0, loggedIn: 0, neverLoggedIn: 0 });
      } else {
        toast.error(json.error ?? "Could not load portal logins");
      }
    } catch {
      toast.error("Could not load portal logins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (programFilter !== "all" && row.programSlug !== programFilter) return false;
      if (showMissingOnly && row.hasStoredPassword) return false;
      if (showNeverLoggedInOnly && row.hasLoggedIn) return false;
      if (!query) return true;
      return [row.name, row.email, row.whatsapp, row.course, row.module]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rows, search, programFilter, showMissingOnly, showNeverLoggedInOnly]);

  const togglePassword = (id: string) => {
    setVisiblePasswords((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchPasswordForRow = async (row: AdminCredentialRow): Promise<string | null> => {
    const cached = revealedPasswords[row.id];
    if (cached) return cached;

    setLoadingId(row.id);
    const result = await revealEnrollmentPassword(row.id);
    setLoadingId(null);

    if (!result.password) {
      toast.error(result.error ?? "Could not load password");
      return null;
    }

    setRevealedPasswords((current) => ({ ...current, [row.id]: result.password! }));
    return result.password;
  };

  const revealPassword = async (row: AdminCredentialRow) => {
    if (visiblePasswords.has(row.id)) {
      togglePassword(row.id);
      return;
    }

    const password = await fetchPasswordForRow(row);
    if (!password) return;

    togglePassword(row.id);
  };

  const getRowPassword = (row: AdminCredentialRow) => revealedPasswords[row.id] ?? null;

  const copyPasswordForRow = async (row: AdminCredentialRow) => {
    const password = await fetchPasswordForRow(row);
    if (!password) return;
    await copyText("Password", password);
  };

  const copyWhatsAppMessageForRow = async (row: AdminCredentialRow) => {
    const password = await fetchPasswordForRow(row);
    if (!password) return;

    const programLevel = getProgramBySlug(row.programSlug)?.level ?? "—";
    const message = buildStudentLoginWhatsAppMessage({
      studentName: row.name,
      email: row.email,
      password,
      courseName: row.course,
      module: row.module,
      level: programLevel,
      loginUrl: row.loginUrl,
    });
    await copyText("WhatsApp message", message);
  };

  const copyLoginDetailsForRow = async (row: AdminCredentialRow) => {
    const password = await fetchPasswordForRow(row);
    if (!password) return;
    await copyText(
      "Login details",
      `Login ID: ${row.email}\nPassword: ${password}\nPortal: ${row.loginUrl}`
    );
  };

  const handleResendWhatsApp = (row: AdminCredentialRow) => {
    if (isDummyPhoneNumber(row.whatsapp)) {
      toast.warning(
        "Placeholder Phone Number",
        `Student ${row.name} has a placeholder phone number (${row.whatsapp || "N/A"}). Update to a real WhatsApp number to chat.`
      );
    } else {
      toast.success("Opening WhatsApp", `Opening WhatsApp chat for ${row.name}...`);
    }
    const text = buildApprovalWhatsAppMessage({
      studentName: row.name,
      programTitle: row.course,
      email: row.email,
      portalLoginUrl: row.loginUrl,
    });
    const link = getWhatsAppDirectLink(row.whatsapp, text);
    window.open(link, "_blank");
  };

  const handleSendLoginEmail = async (row: AdminCredentialRow) => {
    setLoadingId(row.id);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendLoginEmail", enrollmentId: row.id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Login email sent.");
      } else {
        toast.error(json.error ?? json.message ?? "Email send failed");
      }
    } catch {
      toast.error("Email send failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSyncLoginHashes = async () => {
    setSyncingLogins(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "syncLoginHashes" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Student logins synced.");
        await load();
      } else {
        toast.error(json.error ?? json.message ?? "Sync failed");
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncingLogins(false);
    }
  };

  const handleGenerateMissing = async () => {
    setBulkGenerating(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateMissing" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Missing passwords generated.");
        await load();
      } else {
        toast.error(json.error ?? json.message ?? "Bulk generate failed");
      }
    } catch {
      toast.error("Bulk generate failed");
    } finally {
      setBulkGenerating(false);
    }
  };

  const openEditLogin = (row: AdminCredentialRow) => {
    setEditRow(row);
    setEditEmail(row.email);
    setEditPhone(row.whatsapp === "—" ? "" : row.whatsapp);
  };

  const handleResetAllPasswords = async () => {
    setConfirmResetAll(false);
    setResettingAll(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetAllPasswords" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "All passwords reset.");
        await load();
      } else {
        toast.error(json.error ?? json.message ?? "Reset all failed");
      }
    } catch {
      toast.error("Reset all failed");
    } finally {
      setResettingAll(false);
    }
  };

  const handleEmailAllLogins = async () => {
    setConfirmEmailAll(false);
    setEmailingAll(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "emailAllLogins" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Emails sent.");
      } else {
        toast.error(json.error ?? json.message ?? "Email all failed");
      }
    } catch {
      toast.error("Email all failed");
    } finally {
      setEmailingAll(false);
    }
  };

  const handleFixEmails = async () => {
    setFixingEmails(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fixEmails" }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? "Emails fixed.");
        await load();
      } else {
        toast.error(json.error ?? json.message ?? "Fix emails failed");
      }
    } catch {
      toast.error("Fix emails failed");
    } finally {
      setFixingEmails(false);
    }
  };

  const saveEditLogin = async () => {
    if (!editRow) return;
    const email = editEmail.trim();
    if (!email) {
      toast.error("Login ID (email) is required");
      return;
    }

    setLoadingId(editRow.id);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editRow.studentId,
          email,
          phone: editPhone.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? json.message ?? "Update failed");
        return;
      }

      const updatedEmail = (json.data?.email as string | undefined) ?? email;
      const updatedPhone = (json.data?.phone as string | undefined) ?? editPhone.trim();

      setRows((current) =>
        current.map((item) =>
          item.studentId === editRow.studentId
            ? {
                ...item,
                email: updatedEmail,
                whatsapp: updatedPhone || "—",
              }
            : item
        )
      );
      toast.success(json.message ?? "Login details updated.");
      setEditRow(null);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRepairStudentLogins = async (row: AdminCredentialRow) => {
    setLoadingId(row.id);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "repairStudentLogins", email: row.email }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error ?? json.message ?? "Repair failed");
        return;
      }

      const passwords = json.data?.passwords as
        | Array<{ enrollmentId: string; password: string; module: string }>
        | undefined;
      if (passwords?.length) {
        setRevealedPasswords((current) => {
          const next = { ...current };
          for (const entry of passwords) {
            next[entry.enrollmentId] = entry.password;
          }
          return next;
        });
        const currentModule = passwords.find((entry) => entry.enrollmentId === row.id);
        if (currentModule) {
          setCredentialModal({
            name: row.name,
            loginId: row.email,
            password: currentModule.password,
            loginUrl: row.loginUrl,
            course: row.course,
            module: currentModule.module,
            programSlug: row.programSlug,
          });
        }
      }

      toast.success(json.message ?? "All module logins repaired.");
      await load();
    } catch {
      toast.error("Repair failed");
    } finally {
      setLoadingId(null);
    }
  };

  const handleResetPassword = async (row: AdminCredentialRow) => {
    setLoadingId(row.id);
    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: row.studentId,
          enrollmentId: row.id,
          action: "resetPassword",
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.message ?? json.error ?? "Password reset failed");
        return;
      }

      const password = json.data?.password as string | undefined;
      const loginId = (json.data?.loginId as string | undefined) ?? row.email;
      const loginUrl = (json.data?.loginUrl as string | undefined) ?? row.loginUrl;

      if (password) {
        setRevealedPasswords((current) => ({ ...current, [row.id]: password }));
        setRows((current) =>
          current.map((item) =>
            item.id === row.id
              ? { ...item, hasStoredPassword: true }
              : item
          )
        );
        setMeta((current) => ({
          ...current,
          saved: current.saved + (row.hasStoredPassword ? 0 : 1),
          missing: Math.max(0, current.missing - (row.hasStoredPassword ? 0 : 1)),
        }));
        setCredentialModal({
          name: row.name,
          loginId,
          password,
          loginUrl,
          course: row.course,
          module: row.module,
          programSlug: row.programSlug,
        });
      }

      toast.success(json.message ?? "Password reset.");
    } catch {
      toast.error("Password reset failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={PORTAL_VIEWPORT_PANEL}>
      {/* Header + stats row */}
      <div className="shrink-0 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">Portal Logins</h1>
            <p className="text-xs text-muted mt-0.5">
              Student credentials · share via WhatsApp
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canWrite && (
              <Button
                size="sm"
                variant="secondary"
                disabled={fixingEmails}
                onClick={() => void handleFixEmails()}
                className="h-8 gap-1.5 text-xs border-amber-300/60 bg-amber-50 text-amber-800 hover:bg-amber-100"
              >
                <Wrench size={14} />
                {fixingEmails ? "Fixing..." : "Fix Emails"}
              </Button>
            )}
            {canWrite && (
              <Button
                size="sm"
                variant="secondary"
                disabled={resettingAll}
                onClick={() => setConfirmResetAll(true)}
                className="h-8 gap-1.5 text-xs border-red-300/60 bg-red-50 text-red-800 hover:bg-red-100"
              >
                <Key size={14} />
                {resettingAll ? "Resetting..." : "Reset All Passwords"}
              </Button>
            )}
            {canWrite && (
              <Button
                size="sm"
                variant="secondary"
                disabled={emailingAll}
                onClick={() => setConfirmEmailAll(true)}
                className="h-8 gap-1.5 text-xs border-sky-300/60 bg-sky-50 text-sky-700 hover:bg-sky-100"
              >
                <EnvelopeSimple size={14} weight="fill" />
                {emailingAll ? "Emailing..." : "Email All Logins"}
              </Button>
            )}
            {canWrite && (
              <Button
                size="sm"
                variant="secondary"
                disabled={syncingLogins}
                onClick={() => void handleSyncLoginHashes()}
                className="h-8 gap-1.5 text-xs"
              >
                <ArrowClockwise size={14} />
                {syncingLogins ? "Syncing..." : "Fix login mismatches"}
              </Button>
            )}
            {canWrite && meta.missing > 0 && (
              <Button
                size="sm"
                variant="secondary"
                disabled={bulkGenerating}
                onClick={() => void handleGenerateMissing()}
                className="h-8 gap-1.5 text-xs"
              >
                <ArrowClockwise size={14} />
                {bulkGenerating ? "Generating..." : `Fix ${meta.missing} missing`}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void load()}
              className="h-8 gap-1.5 text-xs shrink-0"
            >
              <ArrowClockwise size={14} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Compact stat chips */}
        <div className="flex flex-wrap gap-1.5">
          <StatChip label="Total" value={meta.total} />
          <StatChip label="Saved" value={meta.saved} tone="emerald" />
          <StatChip label="Missing pwd" value={meta.missing} tone="amber" />
          <StatChip label="Logged in" value={meta.loggedIn} tone="blue" />
          <StatChip label="No login" value={meta.neverLoggedIn} tone="red" />
        </div>

        {/* Toolbar: search + filters */}
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, WhatsApp..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 shrink-0">
            <FilterPill
              active={programFilter === "all"}
              onClick={() => setProgramFilter("all")}
              label={`All ${rows.length}`}
            />
            {ENROLLABLE_PROGRAM_SLUGS.map((slug) => {
              const category = getProgramCategory(slug);
              const count = rows.filter((row) => row.programSlug === slug).length;
              return (
                <FilterPill
                  key={slug}
                  active={programFilter === slug}
                  onClick={() => setProgramFilter(slug)}
                  label={`${category?.shortLabel ?? slug} ${count}`}
                />
              );
            })}
            <FilterPill
              active={showMissingOnly}
              onClick={() => {
                setShowMissingOnly((v) => !v);
                if (!showMissingOnly) setShowNeverLoggedInOnly(false);
              }}
              label={`Missing ${meta.missing}`}
              variant="amber"
            />
            <FilterPill
              active={showNeverLoggedInOnly}
              onClick={() => {
                setShowNeverLoggedInOnly((v) => !v);
                if (!showNeverLoggedInOnly) setShowMissingOnly(false);
              }}
              label={`No login ${meta.neverLoggedIn}`}
              variant="red"
            />
          </div>
        </div>

        <p className="text-xs text-muted">
          {loading ? "Loading..." : `${filtered.length} of ${rows.length} module logins`}
        </p>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex-1 min-h-0 overflow-auto space-y-3 pb-2">
        {loading ? (
          <>
            <div className="h-28 rounded-xl border border-border bg-surface/60 animate-pulse" />
            <div className="h-28 rounded-xl border border-border bg-surface/60 animate-pulse" />
          </>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted rounded-xl border border-border bg-background">
            No students match your filters.
          </p>
        ) : (
          filtered.map((row) => (
            <div
              key={row.id}
              className={cn(
                "rounded-xl border border-border bg-background p-4 space-y-2",
                !row.hasLoggedIn && "bg-red-50/40"
              )}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <OpenStudentProfileButton target={{ enrollmentId: row.id }} className="font-semibold text-sm">
                  {row.name}
                </OpenStudentProfileButton>
                {row.isDemo && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">{row.course} · {row.module}</p>
              <p className="text-xs font-mono truncate">{row.email}</p>
              <p className="text-xs text-muted">
                Login: {row.hasLoggedIn ? "Done" : "Pending"}
                {row.hasStoredPassword ? " · Password saved" : " · No password"}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <AdminStudentProfileButton target={{ enrollmentId: row.id }} compact />
                {canWrite && row.hasStoredPassword && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs gap-1"
                      disabled={loadingId === row.id}
                      title="Email login details"
                      onClick={() => void handleSendLoginEmail(row)}
                    >
                      <EnvelopeSimple size={14} weight="fill" />
                      Email
                    </Button>
                    {!row.isDemo && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs"
                        disabled={loadingId === row.id}
                        title="After student messages +92 321 5919502 with Portal login"
                        onClick={() => void handleResendWhatsApp(row)}
                      >
                        WhatsApp
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:flex flex-1 min-h-0 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="h-full overflow-auto scrollbar-none">
          <table className="min-w-[960px] w-full text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur-sm">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">Student</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">WhatsApp</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">Course</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">Login</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">Login ID</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">Password</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">Approved</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-muted">
                    Loading portal logins...
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const visible = visiblePasswords.has(row.id);
                  const password = getRowPassword(row);
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "align-top hover:bg-surface/50",
                        !row.hasLoggedIn && "bg-red-50/40"
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <OpenStudentProfileButton
                            target={{ enrollmentId: row.id }}
                            className="font-medium text-sm hover:underline"
                          >
                            {row.name}
                          </OpenStudentProfileButton>
                          {row.isDemo && (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-800">
                              Demo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{row.whatsapp}</span>
                          {row.whatsapp !== "—" && (
                            <button
                              type="button"
                              title="Copy WhatsApp"
                              onClick={() => void copyText("WhatsApp", row.whatsapp)}
                              className="rounded p-1 hover:bg-surface shrink-0 text-muted"
                            >
                              <Copy size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-xs font-medium">{row.course}</p>
                        <p className="text-[11px] text-muted">{row.module}</p>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {row.hasLoggedIn ? (
                          <span
                            title={
                              row.firstLoginAt
                                ? `First: ${formatAppliedDateTime(row.firstLoginAt)}`
                                : undefined
                            }
                            className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                          >
                            Done
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[11px] max-w-[140px] truncate">{row.email}</span>
                          {canWrite && (
                            <button
                              type="button"
                              title="Edit login ID"
                              onClick={() => openEditLogin(row)}
                              className="rounded p-1 hover:bg-surface text-muted"
                            >
                              <PencilSimple size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Copy login ID"
                            onClick={() => void copyText("Login ID", row.email)}
                            className="rounded p-1 hover:bg-surface text-muted"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {row.hasStoredPassword ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[11px]">
                              {visible ? password ?? "…" : "••••••"}
                            </span>
                            <button
                              type="button"
                              title={visible ? "Hide" : "Show"}
                              disabled={loadingId === row.id}
                              onClick={() => void revealPassword(row)}
                              className="rounded p-1 hover:bg-surface text-muted"
                            >
                              {visible ? <EyeSlash size={12} /> : <Eye size={12} />}
                            </button>
                            <button
                              type="button"
                              title="Copy password"
                              disabled={loadingId === row.id}
                              onClick={() => void copyPasswordForRow(row)}
                              className="rounded p-1 hover:bg-surface text-muted disabled:opacity-40"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        ) : canWrite ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={loadingId === row.id}
                            onClick={() => void handleResetPassword(row)}
                            className="h-7 gap-1 text-[11px] px-2"
                          >
                            <Key size={12} />
                            Generate
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-[11px] text-muted">
                        {row.approvedAt ? formatAppliedDateTime(row.approvedAt) : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <AdminStudentProfileButton target={{ enrollmentId: row.id }} compact />
                          <button
                            type="button"
                            title="Copy full login details"
                            disabled={loadingId === row.id}
                            onClick={() => void copyLoginDetailsForRow(row)}
                            className="rounded border border-border p-1.5 hover:bg-surface disabled:opacity-40"
                          >
                            <Copy size={14} />
                          </button>
                          {canWrite && (
                            <>
                              <button
                                type="button"
                                title="Email login details to student"
                                disabled={!row.hasStoredPassword || loadingId === row.id}
                                onClick={() => void handleSendLoginEmail(row)}
                                className="rounded border border-sky-300/60 bg-sky-50 p-1.5 text-sky-700 hover:bg-sky-100 disabled:opacity-40"
                              >
                                <EnvelopeSimple size={14} weight="fill" />
                              </button>
                              {!row.isDemo && (
                                <button
                                  type="button"
                                  title="Send login via WhatsApp (student must message +92 321 5919502 first)"
                                  disabled={!row.hasStoredPassword || loadingId === row.id}
                                  onClick={() => void handleResendWhatsApp(row)}
                                  className="rounded border border-[#25D366]/40 bg-[#25D366]/10 p-1.5 text-[#128C7E] hover:bg-[#25D366]/20 disabled:opacity-40"
                                >
                                  <ChatsCircle size={14} weight="fill" />
                                </button>
                              )}
                              <button
                                type="button"
                                title="Repair all module logins for this student"
                                disabled={loadingId === row.id}
                                onClick={() => void handleRepairStudentLogins(row)}
                                className="rounded border border-amber-300/60 bg-amber-50 p-1.5 text-amber-800 hover:bg-amber-100"
                              >
                                <ArrowClockwise size={14} />
                              </button>
                              <button
                                type="button"
                                title="Reset password"
                                disabled={loadingId === row.id}
                                onClick={() => void handleResetPassword(row)}
                                className="rounded border border-border p-1.5 hover:bg-surface"
                              >
                                <ArrowClockwise size={14} />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            title="Copy WhatsApp message"
                            disabled={loadingId === row.id}
                            onClick={() => void copyWhatsAppMessageForRow(row)}
                            className="rounded border border-border p-1.5 hover:bg-surface disabled:opacity-40"
                          >
                            <ChatsCircle size={14} weight="duotone" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={Boolean(editRow)}
        onClose={() => setEditRow(null)}
        title="Edit Login Details"
      >
        {editRow && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Update portal login for <strong>{editRow.name}</strong>. Changing the login ID updates
              their email for sign-in and linked registrations.
            </p>
            <label className="block text-sm">
              <span className="font-medium">Login ID (email)</span>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="mt-1.5 font-mono text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">WhatsApp / phone</span>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="03xx-xxxxxxx"
                className="mt-1.5"
              />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditRow(null)}>
                Cancel
              </Button>
              <Button disabled={loadingId === editRow.id} onClick={() => void saveEditLogin()}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(credentialModal)}
        onClose={() => setCredentialModal(null)}
        title="Student Portal Login"
      >
        {credentialModal && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Share these details with <strong>{credentialModal.name}</strong> if WhatsApp
              was not received.
            </p>
            <div className="rounded-xl border border-border bg-surface p-4 space-y-2 text-sm">
              <p>
                <span className="text-muted">Login ID:</span>{" "}
                <strong className="font-mono">{credentialModal.loginId}</strong>
              </p>
              <p>
                <span className="text-muted">Password:</span>{" "}
                <strong className="font-mono">{credentialModal.password}</strong>
              </p>
              <p>
                <span className="text-muted">Portal:</span>{" "}
                <a href={credentialModal.loginUrl} className="text-primary underline">
                  {credentialModal.loginUrl}
                </a>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() =>
                  void copyText(
                    "Login details",
                    `Login ID: ${credentialModal.loginId}\nPassword: ${credentialModal.password}\nPortal: ${credentialModal.loginUrl}`
                  )
                }
              >
                <Copy size={16} />
                Copy Login
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() =>
                  void copyText(
                    "WhatsApp message",
                    buildStudentLoginWhatsAppMessage({
                      studentName: credentialModal.name,
                      email: credentialModal.loginId,
                      password: credentialModal.password,
                      courseName: credentialModal.course,
                      module: credentialModal.module,
                      level: getProgramBySlug(credentialModal.programSlug)?.level ?? "—",
                      loginUrl: credentialModal.loginUrl,
                    })
                  )
                }
              >
                <ChatsCircle size={16} />
                Copy WhatsApp Text
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Reset All Passwords Modal */}
      <Modal
        open={confirmResetAll}
        onClose={() => setConfirmResetAll(false)}
        title="Reset All Student Passwords"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <Warning size={24} weight="fill" className="shrink-0 text-red-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-800">
                This will reset passwords for ALL {meta.total} student(s).
              </p>
              <p className="text-red-700 mt-1">
                Every student will get a new password. Old passwords will stop working immediately.
                You can then click &quot;Email All Logins&quot; to send the new passwords.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmResetAll(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleResetAllPasswords()}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Key size={16} className="mr-1.5" />
              Reset All Passwords
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Email All Logins Modal */}
      <Modal
        open={confirmEmailAll}
        onClose={() => setConfirmEmailAll(false)}
        title="Email All Student Logins"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
            <EnvelopeSimple size={24} weight="fill" className="shrink-0 text-sky-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-sky-800">
                Send login details to ALL {meta.total} student(s) via email.
              </p>
              <p className="text-sky-700 mt-1">
                Each student will receive an email with their login ID, password, and portal link.
                Students without a saved password will be skipped.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmEmailAll(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleEmailAllLogins()}
              className="bg-sky-600 text-white hover:bg-sky-700"
            >
              <EnvelopeSimple size={16} weight="fill" className="mr-1.5" />
              Email All Logins
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatChip({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "emerald" | "amber" | "blue" | "red";
}) {
  const styles = {
    default: "portal-stat-chip",
    emerald: "portal-stat-chip-emerald",
    amber: "portal-stat-chip-amber",
    blue: "portal-stat-chip-blue",
    red: "portal-stat-chip-red",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs",
        styles[tone]
      )}
    >
      <span className="opacity-70">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  variant = "default",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  variant?: "default" | "amber" | "red";
}) {
  const activeStyles = {
    default: "bg-primary text-primary-foreground border-primary",
    amber: "bg-amber-600 text-white border-amber-600",
    red: "bg-red-600 text-white border-red-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap",
        active
          ? activeStyles[variant]
          : "border-border bg-background text-muted hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
