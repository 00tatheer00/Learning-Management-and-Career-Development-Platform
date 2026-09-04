"use client";

import { useState, useMemo, useCallback } from "react";
import {
  WhatsappLogo,
  Copy,
  Check,
  ArrowSquareOut,
  CheckCircle,
  XCircle,
  ChatCircleText,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ADMIN_REJECT_PRESETS } from "@/lib/constants/admin-reject-reasons";
import {
  formatApprovalWhatsAppMessage,
  formatRejectionWhatsAppMessage,
  sanitizeWhatsAppPhone,
  buildWhatsAppChatUrl,
} from "@/lib/notifications/whatsapp-templates";
import { toast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

export interface WhatsAppTemplatePillProps {
  studentName: string;
  phone?: string | null;
  email?: string | null;
  courseTitle?: string | null;
  moduleName?: string | null;
  status?: "pending" | "approved" | "rejected" | string;
  adminNotes?: string | null;
  plainPassword?: string;
  portalUrl?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "pill" | "button" | "compact";
  className?: string;
}

export function WhatsAppTemplatePill({
  studentName,
  phone,
  email,
  courseTitle,
  moduleName,
  status = "pending",
  adminNotes,
  plainPassword,
  portalUrl,
  size = "sm",
  variant = "pill",
  className,
}: WhatsAppTemplatePillProps) {
  const safeEmail = email ?? "";
  const safeCourseTitle = courseTitle ?? "Selected Program";
  const safeModuleName = moduleName ?? "Module 1";
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"approval" | "rejection">(
    status === "rejected" ? "rejection" : "approval"
  );
  const [copiedType, setCopiedType] = useState<"approval" | "rejection" | "phone" | null>(null);

  // Rejection reason state
  const [rejectionReason, setRejectionReason] = useState(
    adminNotes?.trim() || ADMIN_REJECT_PRESETS[0].message
  );

  // Approval custom password override
  const [passwordInput, setPasswordInput] = useState(plainPassword ?? "");

  const cleanPhone = useMemo(() => sanitizeWhatsAppPhone(phone), [phone]);

  const approvalMessage = useMemo(() => {
    return formatApprovalWhatsAppMessage({
      studentName,
      courseTitle: safeCourseTitle,
      moduleName: safeModuleName,
      email: safeEmail,
      password: passwordInput || plainPassword,
      portalUrl,
    });
  }, [studentName, safeCourseTitle, safeModuleName, safeEmail, passwordInput, plainPassword, portalUrl]);

  const rejectionMessage = useMemo(() => {
    return formatRejectionWhatsAppMessage({
      studentName,
      courseTitle: safeCourseTitle,
      moduleName: safeModuleName,
      reason: rejectionReason,
    });
  }, [studentName, safeCourseTitle, safeModuleName, rejectionReason]);

  const copyToClipboard = useCallback(
    async (text: string, type: "approval" | "rejection" | "phone", label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedType(type);
        toast.success("Copied to Clipboard", `${label} ready to paste.`);
        setTimeout(() => setCopiedType(null), 2500);
      } catch {
        toast.error("Copy Failed", "Unable to copy text to clipboard.");
      }
    },
    []
  );

  const approvalWhatsAppUrl = useMemo(() => {
    return buildWhatsAppChatUrl(phone, approvalMessage);
  }, [phone, approvalMessage]);

  const rejectionWhatsAppUrl = useMemo(() => {
    return buildWhatsAppChatUrl(phone, rejectionMessage);
  }, [phone, rejectionMessage]);

  if (!phone || !phone.trim()) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs text-muted/60 cursor-not-allowed",
          className
        )}
        title="No WhatsApp number available"
      >
        <WhatsappLogo size={14} className="opacity-40" />
        <span className="text-[11px]">No WA</span>
      </span>
    );
  }

  const buttonSize = size === "xs" || size === "sm" ? "sm" : size === "lg" ? "lg" : "default";

  return (
    <>
      {/* Trigger Button / Pill */}
      {variant === "compact" ? (
        <button
          type="button"
          onClick={() => {
            setActiveTab(status === "rejected" ? "rejection" : "approval");
            setModalOpen(true);
          }}
          title={`WhatsApp template for ${studentName}`}
          className={cn(
            "inline-flex items-center justify-center rounded-lg p-1.5 transition-all",
            "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800",
            "dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60",
            "border border-emerald-200 dark:border-emerald-800",
            className
          )}
        >
          <WhatsappLogo size={16} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
        </button>
      ) : variant === "button" ? (
        <Button
          type="button"
          size={buttonSize}
          variant="secondary"
          onClick={() => {
            setActiveTab(status === "rejected" ? "rejection" : "approval");
            setModalOpen(true);
          }}
          className={cn(
            "gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40",
            className
          )}
        >
          <WhatsappLogo size={size === "xs" ? 14 : size === "lg" ? 18 : 16} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
          <span>WhatsApp Notice</span>
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setActiveTab(status === "rejected" ? "rejection" : "approval");
            setModalOpen(true);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all shadow-2xs cursor-pointer",
            "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900",
            "dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/70",
            "border border-emerald-300 dark:border-emerald-700/60",
            size === "xs" && "px-2 py-0.5 text-[11px]",
            size === "sm" && "px-2.5 py-1 text-xs",
            size === "md" && "px-3 py-1.5 text-xs sm:text-sm",
            size === "lg" && "px-3.5 py-2 text-sm",
            className
          )}
          title={`Click to copy Approval or Rejection WhatsApp template for ${studentName}`}
        >
          <WhatsappLogo
            size={size === "xs" ? 13 : size === "sm" ? 15 : size === "lg" ? 18 : 17}
            weight="fill"
            className="text-emerald-600 dark:text-emerald-400 shrink-0"
          />
          <span className="truncate">WhatsApp</span>
        </button>
      )}

      {/* WhatsApp Message Template Dialog */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="WhatsApp Message Templates"
        className="max-w-xl"
        mobileSheet
      >
        {/* Student Info Card */}
        <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-base font-bold text-foreground">{studentName}</p>
              <p className="text-xs text-muted">
                {courseTitle} {moduleName ? `· ${moduleName}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-background px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {phone}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(phone, "phone", "Phone number")}
                className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-background border border-emerald-200 dark:border-emerald-800 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
                title="Copy phone"
              >
                {copiedType === "phone" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                {copiedType === "phone" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection: Approval vs Rejection */}
        <div className="flex rounded-xl bg-surface p-1 border border-border mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("approval")}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all",
              activeTab === "approval"
                ? "bg-background text-emerald-700 dark:text-emerald-400 shadow-xs border border-border"
                : "text-muted hover:text-foreground"
            )}
          >
            <CheckCircle size={15} weight="duotone" className="text-emerald-600" />
            Approval Template
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rejection")}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all",
              activeTab === "rejection"
                ? "bg-background text-red-600 dark:text-red-400 shadow-xs border border-border"
                : "text-muted hover:text-foreground"
            )}
          >
            <XCircle size={15} weight="duotone" className="text-red-500" />
            Rejection Template
          </button>
        </div>

        {/* Tab 1: Approval Template */}
        {activeTab === "approval" && (
          <div className="space-y-4">
            {plainPassword === undefined && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                  Portal Password (Optional override)
                </label>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Leave empty to instruct student to check email"
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Live Message Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <ChatCircleText size={14} className="text-emerald-600" />
                  Message Preview (WhatsApp Formatted)
                </span>
                <span className="text-[10px] text-muted">Ready to copy &amp; send</span>
              </div>
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5 max-h-52 overflow-y-auto font-sans text-xs sm:text-[13px] leading-relaxed text-foreground whitespace-pre-wrap select-all">
                {approvalMessage}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a
                  href={approvalWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsappLogo size={16} weight="fill" className="text-emerald-600" />
                  Open in WhatsApp Web
                  <ArrowSquareOut size={13} />
                </a>
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() =>
                  copyToClipboard(approvalMessage, "approval", "Approval WhatsApp Message")
                }
              >
                {copiedType === "approval" ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Approval Message
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Rejection Template */}
        {activeTab === "rejection" && (
          <div className="space-y-4">
            {/* Preset chips */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                Quick Reason Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ADMIN_REJECT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setRejectionReason(preset.message)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all",
                      rejectionReason === preset.message
                        ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800"
                        : "bg-surface border-border text-muted hover:text-foreground"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Textarea */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                Reason Detail
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-red-500 focus:outline-none resize-none"
                placeholder="Specify reason for rejection..."
              />
            </div>

            {/* Live Message Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <ChatCircleText size={14} className="text-red-500" />
                  Message Preview (WhatsApp Formatted)
                </span>
                <span className="text-[10px] text-muted">Ready to copy &amp; send</span>
              </div>
              <div className="rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50/20 dark:bg-red-950/20 p-3.5 max-h-52 overflow-y-auto font-sans text-xs sm:text-[13px] leading-relaxed text-foreground whitespace-pre-wrap select-all">
                {rejectionMessage}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                asChild
              >
                <a
                  href={rejectionWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsappLogo size={16} weight="fill" className="text-emerald-600" />
                  Open in WhatsApp Web
                  <ArrowSquareOut size={13} />
                </a>
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                onClick={() =>
                  copyToClipboard(rejectionMessage, "rejection", "Rejection WhatsApp Message")
                }
              >
                {copiedType === "rejection" ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Rejection Message
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
