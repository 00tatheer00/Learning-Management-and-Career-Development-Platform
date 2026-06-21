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
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { buildApprovalWhatsAppMessage } from "@/lib/notifications/approval-templates";
import { formatAppliedDateTime } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import type { AdminCredentialRow } from "@/lib/api/admin-credentials";

interface CredentialsMeta {
  total: number;
  saved: number;
  missing: number;
}

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Could not copy");
  }
}

export function AdminCredentialsPanel() {
  const [rows, setRows] = useState<AdminCredentialRow[]>([]);
  const [meta, setMeta] = useState<CredentialsMeta>({ total: 0, saved: 0, missing: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [credentialModal, setCredentialModal] = useState<{
    name: string;
    loginId: string;
    password: string;
    loginUrl: string;
    course: string;
    module: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/credentials", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setRows(json.data?.rows ?? []);
        setMeta(json.data?.meta ?? { total: 0, saved: 0, missing: 0 });
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
      if (!query) return true;
      return [row.name, row.email, row.whatsapp, row.course, row.module]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rows, search, programFilter, showMissingOnly]);

  const togglePassword = (id: string) => {
    setVisiblePasswords((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const buildWhatsAppMessage = (row: AdminCredentialRow) => {
    if (!row.password) return "";
    return buildApprovalWhatsAppMessage({
      studentName: row.name,
      email: row.email,
      password: row.password,
      courseName: row.course,
      level: row.module,
      loginUrl: row.loginUrl,
    });
  };

  const handleResetPassword = async (row: AdminCredentialRow) => {
    setLoadingId(row.id);
    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, action: "resetPassword" }),
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
        setRows((current) =>
          current.map((item) =>
            item.id === row.id
              ? { ...item, password, hasStoredPassword: true }
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
    <div>
      <PortalPageHeader
        title="Portal Logins"
        description="View and share student portal username and password when WhatsApp or email is missed."
      />

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted">Approved Students</p>
          <p className="text-2xl font-bold">{meta.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">Password Saved</p>
          <p className="text-2xl font-bold text-emerald-900">{meta.saved}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">Need Password Saved</p>
          <p className="text-2xl font-bold text-amber-900">{meta.missing}</p>
        </div>
      </div>

      {meta.missing > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>{meta.missing} student(s)</strong> were approved before login saving was enabled.
          Use <strong>Generate &amp; Save</strong> to create a new password you can share manually.
          Old passwords cannot be recovered from the system.
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setProgramFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            programFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background text-muted hover:text-foreground"
          }`}
        >
          All ({rows.length})
        </button>
        {ENROLLABLE_PROGRAM_SLUGS.map((slug) => {
          const category = getProgramCategory(slug);
          const count = rows.filter((row) => row.programSlug === slug).length;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => setProgramFilter(slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                programFilter === slug
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted hover:text-foreground"
              }`}
            >
              {category?.shortLabel ?? slug} ({count})
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowMissingOnly((value) => !value)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            showMissingOnly
              ? "bg-amber-600 text-white"
              : "border border-border bg-background text-muted hover:text-foreground"
          }`}
        >
          Missing only ({meta.missing})
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, WhatsApp..."
            className="pl-10"
          />
        </div>
        <Button variant="secondary" onClick={() => void load()} className="gap-2 shrink-0">
          <ArrowClockwise size={18} />
          Refresh
        </Button>
      </div>

      <p className="mb-3 text-sm text-muted">
        {loading ? "Loading..." : `${filtered.length} of ${rows.length} students shown`}
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Course</th>
                <th className="px-4 py-3 text-left font-semibold">Login ID</th>
                <th className="px-4 py-3 text-left font-semibold">Password</th>
                <th className="px-4 py-3 text-left font-semibold">Approved</th>
                <th className="px-4 py-3 text-left font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!loading &&
                filtered.map((row) => {
                  const visible = visiblePasswords.has(row.id);
                  return (
                    <tr key={row.id} className="align-top hover:bg-surface/50">
                      <td className="px-4 py-4">
                        <p className="font-semibold">{row.name}</p>
                        <p className="mt-1 text-muted">{row.whatsapp}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{row.course}</p>
                        <p className="mt-1 text-xs text-muted">
                          {row.module} · {row.batch}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{row.email}</span>
                          <button
                            type="button"
                            title="Copy login ID"
                            onClick={() => void copyText("Login ID", row.email)}
                            className="rounded-lg border border-border p-1.5 hover:bg-surface"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {row.password ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">
                              {visible ? row.password : "••••••••"}
                            </span>
                            <button
                              type="button"
                              title={visible ? "Hide password" : "Show password"}
                              onClick={() => togglePassword(row.id)}
                              className="rounded-lg border border-border p-1.5 hover:bg-surface"
                            >
                              {visible ? <EyeSlash size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              type="button"
                              title="Copy password"
                              onClick={() => void copyText("Password", row.password!)}
                              className="rounded-lg border border-border p-1.5 hover:bg-surface"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                              Not saved
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={loadingId === row.id}
                              onClick={() => void handleResetPassword(row)}
                              className="gap-1.5"
                            >
                              <Key size={14} />
                              Generate &amp; Save
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-muted">
                        {row.approvedAt ? formatAppliedDateTime(row.approvedAt) : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            title="Copy full login details"
                            disabled={!row.password}
                            onClick={() =>
                              void copyText(
                                "Login details",
                                `Login ID: ${row.email}\nPassword: ${row.password}\nPortal: ${row.loginUrl}`
                              )
                            }
                            className="rounded-lg border border-border p-2 hover:bg-surface disabled:opacity-40"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            type="button"
                            title="Copy WhatsApp message"
                            disabled={!row.password}
                            onClick={() => void copyText("WhatsApp message", buildWhatsAppMessage(row))}
                            className="rounded-lg border border-border p-2 hover:bg-surface disabled:opacity-40"
                          >
                            <ChatsCircle size={16} weight="duotone" />
                          </button>
                          <button
                            type="button"
                            title="Reset password"
                            disabled={loadingId === row.id}
                            onClick={() => void handleResetPassword(row)}
                            className="rounded-lg border border-border p-2 hover:bg-surface"
                          >
                            <ArrowClockwise size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={Boolean(credentialModal)}
        onClose={() => setCredentialModal(null)}
        title="Student Portal Login"
      >
        {credentialModal && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Share these details with <strong>{credentialModal.name}</strong> if WhatsApp or email
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
                    buildApprovalWhatsAppMessage({
                      studentName: credentialModal.name,
                      email: credentialModal.loginId,
                      password: credentialModal.password,
                      courseName: credentialModal.course,
                      level: credentialModal.module,
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
    </div>
  );
}
