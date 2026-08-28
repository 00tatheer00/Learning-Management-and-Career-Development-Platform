"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Lifebuoy,
  Clock,
  CheckCircle,
  Spinner,
  ArrowClockwise,
  Warning,
  CaretDown,
  Ticket,
  ShieldCheck,
  XCircle,
  MagnifyingGlass,
  Funnel,
  PaperPlaneTilt,
  X,
  Timer,
  User,
  Envelope,
  Tag,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  adminReply: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

const CATEGORIES = [
  { value: "login", label: "Login / Password", emoji: "🔑" },
  { value: "module", label: "Module / Course", emoji: "📚" },
  { value: "payment", label: "Payment", emoji: "💳" },
  { value: "assignment", label: "Assignment", emoji: "📝" },
  { value: "live-class", label: "Live Class", emoji: "📹" },
  { value: "other", label: "Other", emoji: "💬" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "open", label: "🟡 Open" },
  { value: "in_progress", label: "🔵 In Progress" },
  { value: "resolved", label: "🟢 Resolved" },
  { value: "closed", label: "⚫ Closed" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  open: { label: "Open", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  in_progress: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  resolved: { label: "Resolved", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  closed: { label: "Closed", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", dot: "bg-slate-400" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-slate-500" },
  medium: { label: "Medium", color: "text-amber-600" },
  high: { label: "High", color: "text-red-600" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSlaStatus(createdAt: string, status: string): { label: string; color: string; urgent: boolean } {
  if (status === "resolved" || status === "closed") return { label: "Done", color: "text-emerald-600", urgent: false };
  const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (hours < 24) return { label: `${Math.floor(hours)}h`, color: "text-emerald-600", urgent: false };
  if (hours < 48) return { label: `${Math.floor(hours)}h`, color: "text-amber-600", urgent: false };
  return { label: `${Math.floor(hours)}h — OVERDUE`, color: "text-red-600", urgent: true };
}

export function AdminSupportPanel() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("resolved");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterCategory !== "all") params.set("category", filterCategory);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/support?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data) {
        setTickets(data.data.tickets);
        setStats(data.data.stats);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory, search]);

  useEffect(() => {
    setLoading(true);
    void fetchTickets();
  }, [fetchTickets]);

  const handleReply = async () => {
    if (!activeTicket) return;
    setUpdating(true);
    setUpdateError("");

    try {
      const res = await fetch(`/api/admin/support/${activeTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminReply: replyText.trim() || undefined,
          status: replyStatus,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setUpdateError(data.error || "Failed to update ticket");
        return;
      }

      setActiveTicket(null);
      setReplyText("");
      setReplyStatus("resolved");
      await fetchTickets();
    } catch {
      setUpdateError("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickStatus = async (ticket: SupportTicket, newStatus: string) => {
    try {
      await fetch(`/api/admin/support/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchTickets();
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <PortalPageHeader
        title="Support Tickets"
        description="Manage student support requests. SLA: 48 hours response time."
        eyebrow="Helpdesk"
      >
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void fetchTickets();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-pt-muted hover:bg-secondary transition-colors"
        >
          <ArrowClockwise size={14} />
          Refresh
        </button>
      </PortalPageHeader>

      {/* Stats cards — Executive Portal Tones */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            key: "all",
            label: "Total Tickets",
            value: stats.total,
            hint: "All submissions",
            icon: <Ticket size={18} weight="duotone" />,
            cardTone: "portal-tone-slate",
            iconTone: "portal-tone-icon-slate",
            highlight: false,
          },
          {
            key: "open",
            label: "Open / Pending",
            value: stats.open,
            hint: "Needs review",
            icon: <Clock size={18} weight="duotone" />,
            cardTone: "portal-tone-amber",
            iconTone: "portal-tone-icon-amber",
            dot: "bg-amber-500",
            highlight: stats.open > 0,
          },
          {
            key: "in_progress",
            label: "In Progress",
            value: stats.in_progress,
            hint: "Under investigation",
            icon: <ArrowsClockwise size={18} weight="duotone" />,
            cardTone: "portal-tone-indigo",
            iconTone: "portal-tone-icon-indigo",
            dot: "bg-indigo-500",
            highlight: stats.in_progress > 0,
          },
          {
            key: "resolved",
            label: "Resolved",
            value: stats.resolved,
            hint: "Successfully solved",
            icon: <CheckCircle size={18} weight="duotone" />,
            cardTone: "portal-tone-emerald",
            iconTone: "portal-tone-icon-emerald",
            highlight: false,
          },
          {
            key: "closed",
            label: "Closed",
            value: stats.closed,
            hint: "Archived & finished",
            icon: <XCircle size={18} weight="duotone" />,
            cardTone: "portal-tone-slate",
            iconTone: "portal-tone-icon-slate",
            highlight: false,
          },
        ].map((card) => {
          const isSelected = filterStatus === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilterStatus(card.key)}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer shadow-pt hover:shadow-pt-md hover:-translate-y-0.5",
                card.cardTone,
                isSelected
                  ? "ring-2 ring-primary border-primary shadow-pt-md"
                  : "border-border/80 hover:border-border"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs transition-transform duration-200 group-hover:scale-105",
                    card.iconTone
                  )}
                >
                  {card.icon}
                </div>
                {card.highlight && (
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full animate-pulse",
                      card.dot || "bg-amber-500"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="mt-3">
                <p className="text-2xl font-bold tabular-nums tracking-tight text-pt">
                  {card.value}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-pt-secondary truncate">
                  {card.label}
                </p>
                <p className="text-[10px] text-pt-faint truncate mt-0.5">
                  {card.hint}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pt-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket #, student name, email..."
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-sm text-pt placeholder:text-pt-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div className="relative">
          <Funnel size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pt-faint" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-background pl-8 pr-8 py-2.5 text-sm text-pt focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-pt-faint pointer-events-none" />
        </div>
        <div className="relative">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pt-faint" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-background pl-8 pr-8 py-2.5 text-sm text-pt focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
            ))}
          </select>
          <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-pt-faint pointer-events-none" />
        </div>
      </div>

      {/* Tickets table */}
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
          <p className="text-base font-semibold text-pt mb-1.5">No tickets found</p>
          <p className="text-sm text-pt-muted max-w-md mx-auto">
            {filterStatus !== "all" || filterCategory !== "all" || search
              ? "Try adjusting your filters."
              : "No support tickets have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden bg-background">
          {/* Table header — desktop */}
          <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_140px_120px_100px_90px_100px_80px] gap-3 px-4 py-2.5 border-b border-border bg-secondary/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint">Ticket</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint">Student</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint">Category</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint">Status</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint">Priority</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint">SLA</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint">Action</p>
          </div>

          {tickets.map((ticket) => {
            const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const priorityConf = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
            const catInfo = CATEGORIES.find((c) => c.value === ticket.category);
            const sla = getSlaStatus(ticket.createdAt, ticket.status);

            return (
              <div
                key={ticket.id}
                className={cn(
                  "border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors",
                  sla.urgent && "bg-red-50/30"
                )}
              >
                {/* Desktop row */}
                <div className="hidden lg:grid grid-cols-[minmax(0,1fr)_140px_120px_100px_90px_100px_80px] gap-3 px-4 py-3 items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">{ticket.ticketNumber}</span>
                      {ticket.adminReply && (
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                          <ShieldCheck size={10} weight="fill" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-pt truncate mt-0.5">{ticket.subject}</p>
                    <p className="text-[10px] text-pt-faint mt-0.5">{formatDate(ticket.createdAt)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-pt truncate">{ticket.studentName}</p>
                    <p className="text-[10px] text-pt-faint truncate">{ticket.studentEmail}</p>
                  </div>
                  <div>
                    <span className="text-xs">{catInfo?.emoji} {catInfo?.label || ticket.category}</span>
                  </div>
                  <div>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold border", statusConf.bg, statusConf.color)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusConf.dot)} />
                      {statusConf.label}
                    </span>
                  </div>
                  <div>
                    <span className={cn("text-xs font-medium", priorityConf.color)}>
                      {priorityConf.label}
                    </span>
                  </div>
                  <div>
                    <span className={cn("text-xs font-semibold flex items-center gap-1", sla.color)}>
                      <Timer size={12} weight="fill" />
                      {sla.label}
                    </span>
                  </div>
                  <div>
                    {(ticket.status === "open" || ticket.status === "in_progress") ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTicket(ticket);
                          setReplyText(ticket.adminReply || "");
                          setReplyStatus("resolved");
                          setUpdateError("");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <PaperPlaneTilt size={12} weight="fill" />
                        Reply
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTicket(ticket);
                          setReplyText(ticket.adminReply || "");
                          setReplyStatus(ticket.status);
                          setUpdateError("");
                        }}
                        className="text-[10px] text-primary hover:underline font-medium"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile card */}
                <div className="lg:hidden p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", statusConf.bg)}>
                      <Ticket size={18} weight="duotone" className={statusConf.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-primary/70">{ticket.ticketNumber}</span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border", statusConf.bg, statusConf.color)}>
                          {statusConf.label}
                        </span>
                        <span className={cn("text-[10px] font-semibold flex items-center gap-0.5", sla.color)}>
                          <Timer size={10} weight="fill" />{sla.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-pt mt-0.5">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-pt-faint">
                        <span className="flex items-center gap-1"><User size={10} />{ticket.studentName}</span>
                        <span>{catInfo?.emoji} {catInfo?.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {ticket.status === "open" && (
                      <button
                        type="button"
                        onClick={() => void handleQuickStatus(ticket, "in_progress")}
                        className="flex-1 rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Mark In Progress
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTicket(ticket);
                        setReplyText(ticket.adminReply || "");
                        setReplyStatus(ticket.status === "open" || ticket.status === "in_progress" ? "resolved" : ticket.status);
                        setUpdateError("");
                      }}
                      className={cn(
                        "flex-1 rounded-lg py-1.5 text-[10px] font-semibold transition-colors",
                        (ticket.status === "open" || ticket.status === "in_progress")
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-border text-pt-muted hover:bg-secondary"
                      )}
                    >
                      {(ticket.status === "open" || ticket.status === "in_progress") ? "Reply & Resolve" : "View Details"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply / Detail drawer */}
      {activeTicket && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setActiveTicket(null)}
            aria-label="Close drawer"
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-background border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-5 py-4">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{activeTicket.ticketNumber}</p>
                <p className="text-base font-bold text-pt mt-0.5">{activeTicket.subject}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-pt-muted"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Student info */}
              <div className="rounded-xl border border-border p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint">Student Info</p>
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-pt-muted" />
                  <span className="font-medium text-pt">{activeTicket.studentName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Envelope size={14} className="text-pt-muted" />
                  <span className="text-pt-muted">{activeTicket.studentEmail}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-[10px] text-pt-faint pt-1">
                  <span>Category: {CATEGORIES.find((c) => c.value === activeTicket.category)?.label || activeTicket.category}</span>
                  <span>Priority: <span className={cn("font-medium capitalize", PRIORITY_CONFIG[activeTicket.priority]?.color)}>{activeTicket.priority}</span></span>
                  <span>Created: {formatDate(activeTicket.createdAt)}</span>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint mb-2">Student&apos;s Message</p>
                <p className="text-sm text-pt whitespace-pre-wrap leading-relaxed">{activeTicket.description}</p>
              </div>

              {/* SLA */}
              {(() => {
                const sla = getSlaStatus(activeTicket.createdAt, activeTicket.status);
                return (
                  <div className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold",
                    sla.urgent ? "border-red-200 bg-red-50 text-red-700" : "border-border bg-secondary/30 text-pt-muted"
                  )}>
                    <Timer size={16} weight="fill" className={sla.color} />
                    <span>SLA: {sla.label}</span>
                    {sla.urgent && <Warning size={16} weight="fill" className="text-red-500 ml-auto" />}
                  </div>
                );
              })()}

              {/* Admin reply form */}
              {(activeTicket.status === "open" || activeTicket.status === "in_progress") ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-pt-faint">Your Response</p>

                  {updateError && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <Warning size={14} weight="fill" className="text-red-500" />
                      {updateError}
                    </div>
                  )}

                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply to the student..."
                    rows={5}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-pt placeholder:text-pt-faint focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                  />

                  {/* Priority selector */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-pt-muted">Priority:</label>
                    <div className="flex gap-1">
                      {(["low", "medium", "high"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={async () => {
                            if (activeTicket.priority !== p) {
                              await fetch(`/api/admin/support/${activeTicket.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ priority: p }),
                              });
                              setActiveTicket({ ...activeTicket, priority: p });
                              void fetchTickets();
                            }
                          }}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-[10px] font-semibold capitalize border transition-colors",
                            activeTicket.priority === p
                              ? p === "high" ? "border-red-300 bg-red-50 text-red-700"
                                : p === "medium" ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-slate-300 bg-slate-50 text-slate-600"
                              : "border-border text-pt-faint hover:bg-secondary"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status + submit */}
                  <div className="flex items-center gap-3">
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-pt focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                    >
                      <option value="in_progress">Mark In Progress</option>
                      <option value="resolved">✅ Resolve</option>
                      <option value="closed">Close</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleReply}
                      disabled={updating}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.97]"
                    >
                      {updating ? (
                        <Spinner size={14} className="animate-spin" />
                      ) : (
                        <PaperPlaneTilt size={14} weight="fill" />
                      )}
                      {updating ? "Updating..." : "Send & Update"}
                    </button>
                  </div>
                </div>
              ) : (
                // Show existing reply for resolved/closed
                activeTicket.adminReply && (
                  <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={14} weight="fill" className="text-emerald-600" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Admin Response</p>
                      {activeTicket.resolvedBy && (
                        <span className="text-[10px] text-emerald-600">by {activeTicket.resolvedBy}</span>
                      )}
                    </div>
                    <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed">{activeTicket.adminReply}</p>
                    {activeTicket.resolvedAt && (
                      <p className="text-[10px] text-emerald-600 mt-2">Resolved: {formatDate(activeTicket.resolvedAt)}</p>
                    )}
                  </div>
                )
              )}

              {/* Quick actions for open tickets */}
              {activeTicket.status === "open" && (
                <button
                  type="button"
                  onClick={async () => {
                    await handleQuickStatus(activeTicket, "in_progress");
                    setActiveTicket({ ...activeTicket, status: "in_progress" });
                  }}
                  className="w-full rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowsClockwise size={16} weight="fill" />
                  Mark as In Progress
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
