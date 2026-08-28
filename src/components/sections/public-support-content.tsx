"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Lifebuoy,
  Clock,
  CheckCircle,
  ShieldCheck,
  Headset,
  PaperPlaneTilt,
  Spinner,
  Warning,
  CaretDown,
  MagnifyingGlass,
  Ticket,
  XCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

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

interface TrackedTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  adminReply: string | null;
  resolvedBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function PublicSupportContent() {
  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successTicket, setSuccessTicket] = useState("");

  // Track state
  const [trackEmail, setTrackEmail] = useState("");
  const [tracking, setTracking] = useState(false);
  const [trackedTickets, setTrackedTickets] = useState<TrackedTicket[] | null>(null);
  const [trackError, setTrackError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessTicket("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, subject, description }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to submit ticket");
        return;
      }

      setSuccessTicket(data.data?.ticketNumber || "submitted");
      setCategory("");
      setSubject("");
      setDescription("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setTrackedTickets(null);
    setTracking(true);

    try {
      const res = await fetch(`/api/support/track?email=${encodeURIComponent(trackEmail.trim())}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setTrackError(data.error || "Failed to fetch tickets");
        return;
      }

      setTrackedTickets(data.data || []);
    } catch {
      setTrackError("Something went wrong. Please try again.");
    } finally {
      setTracking(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Lifebuoy size={32} weight="duotone" className="text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            How can we <span className="gradient-text">help you?</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Submit a support ticket and we&apos;ll respond within <strong>48 hours</strong>. No login required.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1 mb-8 bg-secondary/50 rounded-xl p-1 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("submit")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
              activeTab === "submit"
                ? "bg-background text-primary shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            <PaperPlaneTilt size={16} weight="fill" className="inline mr-1.5 -mt-0.5" />
            Submit Ticket
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
              activeTab === "track"
                ? "bg-background text-primary shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            <MagnifyingGlass size={16} weight="bold" className="inline mr-1.5 -mt-0.5" />
            Track Ticket
          </button>
        </div>

        {/* Submit form */}
        {activeTab === "submit" && (
          <div className="animate-in fade-in duration-300">
            {/* Success */}
            {successTicket && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle size={36} weight="fill" className="text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-900 mb-1">Ticket Submitted!</h3>
                <p className="text-sm text-emerald-800 mb-3">
                  Your ticket number is{" "}
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{successTicket}</span>
                </p>
                <p className="text-xs text-emerald-700 mb-4">
                  Save this number. We&apos;ll respond within 48 hours. Use the &quot;Track Ticket&quot; tab to check status.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessTicket("");
                    setActiveTab("track");
                    setTrackEmail(email);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  <MagnifyingGlass size={16} weight="bold" />
                  Track My Tickets
                </button>
              </div>
            )}

            {!successTicket && (
              <div className="rounded-2xl border border-border bg-background p-5 sm:p-7 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Headset size={20} className="text-primary" weight="duotone" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">Submit a Support Ticket</h2>
                    <p className="text-[11px] text-muted">No account needed — just fill in your details</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    <Warning size={16} weight="fill" className="text-red-500 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name..."
                        required
                        minLength={2}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1.5">
                        Your Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                      <p className="text-[10px] text-muted mt-1">Used to track your ticket — enter the same email you registered with</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full appearance-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      >
                        <option value="">Select issue type...</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>
                        ))}
                      </select>
                      <CaretDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">
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
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your issue in detail. Include any error messages, your registered email, or steps to reproduce the problem..."
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={5}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                    />
                    <p className="text-[10px] text-muted mt-1">{description.length}/2000</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.97]"
                  >
                    {submitting ? (
                      <Spinner size={16} className="animate-spin" />
                    ) : (
                      <PaperPlaneTilt size={16} weight="fill" />
                    )}
                    {submitting ? "Submitting..." : "Submit Ticket"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Track tickets */}
        {activeTab === "track" && (
          <div className="animate-in fade-in duration-300">
            <div className="rounded-2xl border border-border bg-background p-5 sm:p-7 shadow-sm mb-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <MagnifyingGlass size={20} className="text-primary" weight="duotone" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Track Your Tickets</h2>
                  <p className="text-[11px] text-muted">Enter the email you used when submitting</p>
                </div>
              </div>

              {trackError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <Warning size={16} weight="fill" className="text-red-500 shrink-0" />
                  {trackError}
                </div>
              )}

              <form onSubmit={handleTrack} className="flex gap-3">
                <input
                  type="email"
                  value={trackEmail}
                  onChange={(e) => setTrackEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={tracking}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shrink-0"
                >
                  {tracking ? <Spinner size={16} className="animate-spin" /> : <MagnifyingGlass size={16} weight="bold" />}
                  {tracking ? "Searching..." : "Search"}
                </button>
              </form>
            </div>

            {/* Results */}
            {trackedTickets !== null && (
              <div>
                {trackedTickets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                    <Ticket size={32} className="text-muted mx-auto mb-3" weight="duotone" />
                    <p className="font-semibold mb-1">No tickets found</p>
                    <p className="text-sm text-muted">No support tickets found for this email address.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                      {trackedTickets.length} ticket{trackedTickets.length !== 1 ? "s" : ""} found
                    </p>
                    {trackedTickets.map((ticket) => {
                      const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                      const StatusIcon = statusConf.icon;
                      const catInfo = CATEGORIES.find((c) => c.value === ticket.category);

                      return (
                        <div
                          key={ticket.id}
                          className={cn(
                            "rounded-2xl border bg-background overflow-hidden transition-all",
                            ticket.status === "resolved" ? "border-emerald-200/60" :
                            ticket.status === "in_progress" ? "border-blue-200/60" :
                            "border-border"
                          )}
                        >
                          <div className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", statusConf.bg)}>
                                <StatusIcon size={18} weight={ticket.status === "resolved" ? "fill" : "duotone"} className={statusConf.color} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">{ticket.ticketNumber}</span>
                                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border", statusConf.bg, statusConf.color)}>
                                    {statusConf.label}
                                  </span>
                                  {catInfo && <span className="text-[10px] text-muted">{catInfo.emoji} {catInfo.label}</span>}
                                </div>
                                <p className="text-sm font-semibold mt-1">{ticket.subject}</p>
                                <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">{ticket.description}</p>
                                <p className="text-[10px] text-muted mt-2">Submitted: {formatDate(ticket.createdAt)}</p>
                              </div>
                            </div>

                            {ticket.adminReply && (
                              <div className="mt-3 rounded-xl bg-emerald-50/80 border border-emerald-200/50 p-3.5">
                                <div className="flex items-center gap-2 mb-1">
                                  <ShieldCheck size={14} weight="fill" className="text-emerald-600" />
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Admin Response</p>
                                  {ticket.resolvedBy && <span className="text-[10px] text-emerald-600">by {ticket.resolvedBy}</span>}
                                </div>
                                <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed">{ticket.adminReply}</p>
                                {ticket.resolvedAt && (
                                  <p className="text-[10px] text-emerald-600 mt-1.5">Resolved: {formatDate(ticket.resolvedAt)}</p>
                                )}
                              </div>
                            )}

                            {!ticket.adminReply && (ticket.status === "open" || ticket.status === "in_progress") && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                                <Clock size={14} weight="duotone" />
                                <span>Awaiting response — we&apos;ll get back to you within 48 hours</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        <div className="mt-14 mb-10">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-primary/70 mb-8">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: <PaperPlaneTilt size={22} weight="duotone" />, color: "bg-amber-100 text-amber-600", title: "1. Submit", desc: "Fill in the form with your issue details — no login required." },
              { icon: <Clock size={22} weight="duotone" />, color: "bg-blue-100 text-blue-600", title: "2. We Review", desc: "Our team reviews and responds within 48 hours." },
              { icon: <CheckCircle size={22} weight="duotone" />, color: "bg-emerald-100 text-emerald-600", title: "3. Resolved", desc: "Track your ticket status anytime using your email." },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-background p-5 text-center hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className={cn("mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl", step.color)}>
                  {step.icon}
                </div>
                <h3 className="font-bold text-sm mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SLA + logged-in note */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-7 text-center">
          <ShieldCheck size={26} weight="fill" className="text-emerald-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-emerald-900 mb-1.5">48-Hour Response Guarantee</h2>
          <p className="text-sm text-emerald-800 max-w-lg mx-auto leading-relaxed mb-4">
            Every ticket gets a unique tracking number. Track anytime using your email.
          </p>
          <p className="text-xs text-emerald-700">
            Already a student?{" "}
            <Link href="/login" className="font-semibold underline hover:text-emerald-900">
              Login to your portal
            </Link>{" "}
            for real-time tracking & notifications.
          </p>
        </div>
      </div>
    </main>
  );
}
