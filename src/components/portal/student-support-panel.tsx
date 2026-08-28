"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Lifebuoy,
  PaperPlaneTilt,
  Clock,
  CheckCircle,
  Spinner,
  ArrowClockwise,
  Warning,
  CaretDown,
  Ticket,
  ChatDots,
  ShieldCheck,
  XCircle,
  FileArrowUp,
  Image as ImageIcon,
  Trash,
  Eye,
  X,
} from "@phosphor-icons/react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { uploadDirectToCloudinary } from "@/lib/cloudinary-client";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  adminReply: string | null;
  attachmentUrl?: string | null;
  attachmentPublicId?: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: "login", label: "Login / Password Issue", emoji: "🔑" },
  { value: "module", label: "Module / Course Issue", emoji: "📚" },
  { value: "payment", label: "Payment / Verification", emoji: "💳" },
  { value: "assignment", label: "Assignment / Submission", emoji: "📝" },
  { value: "live-class", label: "Live Class Issue", emoji: "📹" },
  { value: "other", label: "Other", emoji: "💬" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  open: { label: "Open", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Spinner },
  resolved: { label: "Resolved", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
  closed: { label: "Closed", color: "text-slate-500", bg: "bg-slate-50 border-slate-200", icon: XCircle },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function StudentSupportPanel() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentPublicId, setAttachmentPublicId] = useState("");
  const [attachmentFileName, setAttachmentFileName] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/support/tickets", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data) {
        setTickets(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setError("");
    setUploadingAttachment(true);
    setUploadProgress(0);

    try {
      const res = await uploadDirectToCloudinary(file, {
        folder: "eest/support-attachments",
        onProgress: (p) => setUploadProgress(p),
      });
      setAttachmentUrl(res.url);
      setAttachmentPublicId(res.publicId);
      setAttachmentFileName(file.name);
    } catch (err) {
      console.error("Student attachment upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload screenshot");
    } finally {
      setUploadingAttachment(false);
    }
  };

  const removeAttachment = () => {
    setAttachmentUrl("");
    setAttachmentPublicId("");
    setAttachmentFileName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject,
          description,
          attachmentUrl: attachmentUrl || undefined,
          attachmentPublicId: attachmentPublicId || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to submit ticket");
        return;
      }

      setSuccess(`Ticket ${data.data?.ticketNumber} submitted successfully! We'll respond within 48 hours.`);
      setCategory("");
      setSubject("");
      setDescription("");
      removeAttachment();
      setShowForm(false);
      await fetchTickets();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  return (
    <div>
      <PortalPageHeader
        title="Support Center"
        description="Submit and track your support tickets. We respond within 48 hours."
        eyebrow="Help & Support"
      >
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-[0.97]"
        >
          <Lifebuoy size={18} weight="duotone" />
          New Ticket
        </button>
      </PortalPageHeader>

      {/* Success toast */}
      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle size={20} weight="fill" className="text-emerald-500 shrink-0" />
          <p>{success}</p>
          <button type="button" onClick={() => setSuccess("")} className="ml-auto text-emerald-600 hover:text-emerald-800">
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Quick stats */}
      {!loading && tickets.length > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Tickets", value: tickets.length, cardTone: "portal-tone-slate", iconTone: "portal-tone-icon-slate", icon: <Ticket size={16} weight="duotone" /> },
            { label: "Active", value: openCount, cardTone: "portal-tone-amber", iconTone: "portal-tone-icon-amber", icon: <Clock size={16} weight="duotone" /> },
            { label: "Resolved", value: tickets.filter((t) => t.status === "resolved").length, cardTone: "portal-tone-emerald", iconTone: "portal-tone-icon-emerald", icon: <CheckCircle size={16} weight="duotone" /> },
            { label: "Closed", value: tickets.filter((t) => t.status === "closed").length, cardTone: "portal-tone-slate", iconTone: "portal-tone-icon-slate", icon: <XCircle size={16} weight="duotone" /> },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-xl border p-3.5 shadow-pt transition-all duration-200",
                item.cardTone,
                "border-border/80"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg shadow-xs", item.iconTone)}>
                  {item.icon}
                </div>
                <span className="text-[11px] font-semibold text-pt-secondary truncate">{item.label}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-pt">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* New ticket form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-background p-5 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Ticket size={18} className="text-primary" weight="duotone" />
            </div>
            <h2 className="text-base font-bold text-pt">Submit New Ticket</h2>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <Warning size={16} weight="fill" className="text-red-500 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-pt-muted mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full appearance-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-pt pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
                <CaretDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-pt-muted pointer-events-none" />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-pt-muted mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue..."
                required
                minLength={3}
                maxLength={150}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-pt placeholder:text-pt-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-pt-muted mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your issue in detail. Include any error messages, screenshots info, or steps to reproduce..."
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-pt placeholder:text-pt-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
              <p className="text-[10px] text-pt-faint mt-1">{description.length}/2000</p>
            </div>

            {/* Screenshot / File Attachment */}
            <div>
              <label className="block text-xs font-semibold text-pt-muted mb-1.5">
                Attachment / Screenshot <span className="text-[11px] font-normal text-pt-faint">(Optional, PNG/JPG/WEBP up to 5MB)</span>
              </label>

              {!attachmentUrl ? (
                <div className="relative">
                  <label className={cn(
                    "flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all",
                    uploadingAttachment && "opacity-60 pointer-events-none"
                  )}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileUpload}
                      disabled={uploadingAttachment}
                      className="hidden"
                    />
                    {uploadingAttachment ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Spinner size={24} className="animate-spin text-primary" />
                        <p className="text-xs font-semibold text-primary">
                          Uploading screenshot... {uploadProgress > 0 ? `${uploadProgress}%` : ""}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <FileArrowUp size={20} weight="duotone" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-pt">Click to upload screenshot or drag image here</p>
                          <p className="text-[10px] text-pt-faint">Helps us resolve your issue faster</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-emerald-300 shrink-0 bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={attachmentUrl} alt="Attached screenshot" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-900 truncate">{attachmentFileName || "Screenshot attached"}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                        <CheckCircle size={12} weight="fill" /> Ready to submit
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(attachmentUrl)}
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove screenshot"
                    >
                      <Trash size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting || uploadingAttachment}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.97]"
              >
                {submitting ? (
                  <Spinner size={16} className="animate-spin" />
                ) : (
                  <PaperPlaneTilt size={16} weight="fill" />
                )}
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-pt-muted hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size={32} className="animate-spin text-primary" />
          <p className="text-sm text-pt-muted">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="portal-card rounded-2xl border border-dashed border-pt p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Lifebuoy size={28} className="text-primary" weight="duotone" />
          </div>
          <p className="text-base font-semibold text-pt mb-1.5">No tickets yet</p>
          <p className="text-sm text-pt-muted mb-5 max-w-md mx-auto">
            Have an issue? Click &quot;New Ticket&quot; to submit a support request and we&apos;ll respond within 48 hours.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <Lifebuoy size={16} weight="duotone" />
            Submit Your First Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-pt-faint">
              Your Tickets ({tickets.length})
            </p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void fetchTickets();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <ArrowClockwise size={14} />
              Refresh
            </button>
          </div>

          {tickets.map((ticket) => {
            const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const StatusIcon = statusConf.icon;
            const catInfo = CATEGORIES.find((c) => c.value === ticket.category);
            const isExpanded = expandedTicket === ticket.id;

            return (
              <div
                key={ticket.id}
                className={cn(
                  "rounded-2xl border bg-background transition-all duration-200",
                  ticket.status === "resolved" ? "border-emerald-200/60" :
                  ticket.status === "in_progress" ? "border-blue-200/60" :
                  ticket.status === "open" ? "border-amber-200/60" :
                  "border-border"
                )}
              >
                {/* Ticket header */}
                <button
                  type="button"
                  onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3 group cursor-pointer"
                >
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    statusConf.bg, "border"
                  )}>
                    <StatusIcon size={18} weight={ticket.status === "resolved" ? "fill" : "duotone"} className={statusConf.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                        {ticket.ticketNumber}
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                        statusConf.bg, statusConf.color
                      )}>
                        {statusConf.label}
                      </span>
                      {catInfo && (
                        <span className="text-[10px] text-pt-faint">
                          {catInfo.emoji} {catInfo.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-pt truncate mt-0.5">
                      {ticket.subject}
                    </p>
                  </div>

                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-[10px] text-pt-faint">{getTimeAgo(ticket.createdAt)}</p>
                    {ticket.adminReply && (
                      <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] text-emerald-600 font-medium">
                        <ChatDots size={12} weight="fill" />
                        Replied
                      </span>
                    )}
                  </div>

                  <CaretDown
                    size={16}
                    className={cn(
                      "shrink-0 text-pt-faint transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-3 animate-in slide-in-from-top-1 duration-200">
                    <div className="rounded-xl bg-secondary/50 p-3.5 mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint mb-1.5">Your Message</p>
                      <p className="text-sm text-pt whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* Attached screenshot preview */}
                    {ticket.attachmentUrl && (
                      <div className="mb-3 p-3 rounded-xl border border-border bg-secondary/30">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint mb-2">Attached Screenshot</p>
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewImage(ticket.attachmentUrl || null)}
                            className="relative h-16 w-24 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity bg-background shrink-0"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ticket.attachmentUrl} alt="Attached screenshot" className="h-full w-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewImage(ticket.attachmentUrl || null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-pt hover:bg-secondary transition-colors"
                          >
                            <ImageIcon size={14} className="text-primary" weight="duotone" />
                            View Full Image
                          </button>
                        </div>
                      </div>
                    )}

                    {ticket.adminReply && (
                      <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/50 p-3.5 mb-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <ShieldCheck size={14} weight="fill" className="text-emerald-600" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Admin Response</p>
                          {ticket.resolvedBy && (
                            <span className="text-[10px] text-emerald-600">by {ticket.resolvedBy}</span>
                          )}
                        </div>
                        <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed">
                          {ticket.adminReply}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-[10px] text-pt-faint">
                      <span>Created: {formatDate(ticket.createdAt)}</span>
                      {ticket.resolvedAt && <span>Resolved: {formatDate(ticket.resolvedAt)}</span>}
                      <span>Priority: <span className="capitalize font-medium">{ticket.priority}</span></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Screenshot Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-background rounded-2xl overflow-hidden shadow-2xl border border-border p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X size={18} weight="bold" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Support Screenshot Preview"
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
