"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  GithubLogo,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Sparkle,
  ArrowSquareOut,
  ChatCircleText,
  MagnifyingGlass,
  ArrowClockwise,
  ListChecks,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/ui/toast";
import type { StudentAutomatedAssignmentView } from "@/lib/assignments/topic-assignment-service";

export function AutomatedAssignmentsManager() {
  const [data, setData] = useState<StudentAutomatedAssignmentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      const res = await fetch("/api/trainer/automated-assignments");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch {
      toast.error("Failed to load automated assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleAutoAssign = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/trainer/automated-assignments", {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Auto-Assignment Sync Complete!", json.message);
        if (json.data?.assignments) {
          setData(json.data.assignments);
        } else {
          await loadData();
        }
      } else {
        toast.error(json.error || "Auto-assignment failed");
      }
    } catch {
      toast.error("Auto-assignment sync error");
    } finally {
      setSyncing(false);
    }
  };

  const handleReview = async (
    submissionId: string,
    status: "approved" | "needs_revision"
  ) => {
    setReviewingId(submissionId);
    try {
      const res = await fetch("/api/trainer/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submissionId,
          status,
          feedback: feedbackMap[submissionId] || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          status === "approved" ? "Project Approved!" : "Requested Revision",
          "Student has been notified."
        );
        await loadData();
      } else {
        toast.error(json.error || "Failed to update review status");
      }
    } catch {
      toast.error("Review submission error");
    } finally {
      setReviewingId(null);
    }
  };

  // Stats calculation
  const totalAssigned = data.length;
  const submittedCount = data.filter((d) => d.submission && d.submission.status === "submitted").length;
  const approvedCount = data.filter((d) => d.submission && d.submission.status === "approved").length;
  const needsRevisionCount = data.filter((d) => d.submission && d.submission.status === "needs_revision").length;
  const notStartedCount = data.filter((d) => !d.submission).length;

  // Filtered items
  const filtered = data.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.assignedTopic.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "submitted") return item.submission?.status === "submitted";
    if (statusFilter === "approved") return item.submission?.status === "approved";
    if (statusFilter === "needs_revision") return item.submission?.status === "needs_revision";
    if (statusFilter === "not_started") return !item.submission;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Trigger Button */}
      <div className="rounded-3xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
            <Sparkle size={14} weight="fill" />
            Web Development Module 1
          </div>
          <h2 className="text-xl font-bold text-foreground">Automated Assignment Management</h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Every enrolled student in Module 1 automatically receives a unique website project topic. Review live deployments, GitHub repositories, and personal portfolios here.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleAutoAssign}
            disabled={syncing || loading}
            className="gap-2 shadow-sm font-semibold"
          >
            <ArrowClockwise size={18} className={syncing ? "animate-spin" : ""} weight="bold" />
            {syncing ? "Assigning..." : "Sync & Auto-Assign Topics"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-xs font-semibold text-muted-foreground">Total Enrolled</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalAssigned}</p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Pending Review</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{submittedCount}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Approved</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{approvedCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Needs Revision</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{needsRevisionCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-muted-foreground">Not Started</p>
          <p className="text-2xl font-bold text-muted-foreground mt-1">{notStartedCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student name, email, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Statuses ({data.length})</option>
            <option value="submitted">Pending Review ({submittedCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="needs_revision">Needs Revision ({needsRevisionCount})</option>
            <option value="not_started">Not Started ({notStartedCount})</option>
          </select>
        </div>
      </div>

      {/* Student Assignments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-border bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground space-y-2">
          <ListChecks size={36} className="mx-auto text-muted-foreground/60" />
          <p className="font-semibold text-base">No students matched your search criteria.</p>
          <p className="text-xs">Try clearing filters or click &quot;Sync &amp; Auto-Assign Topics&quot;.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const sub = item.submission;
            const isSubPending = sub && sub.status === "submitted";
            const isSubApproved = sub && sub.status === "approved";
            const isSubNeedsRevision = sub && sub.status === "needs_revision";
            const isReviewingThis = reviewingId === sub?.id;

            return (
              <div
                key={item.studentId}
                className={`rounded-2xl border p-5 transition-all space-y-4 ${
                  isSubPending
                    ? "border-blue-400/40 bg-blue-500/5 shadow-sm"
                    : isSubApproved
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : isSubNeedsRevision
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border bg-card"
                }`}
              >
                {/* Student Info & Assigned Topic Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {item.topicDetails?.icon || "🌐"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-foreground">{item.studentName}</h3>
                        {item.batch && (
                          <span className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {item.batch}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.email}</p>
                    </div>
                  </div>

                  {/* Topic & Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
                      <span>{item.topicDetails?.icon || "📌"}</span>
                      <span>{item.assignedTopic}</span>
                    </span>

                    {sub ? (
                      isSubApproved ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle size={14} weight="fill" /> Approved
                        </span>
                      ) : isSubNeedsRevision ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <XCircle size={14} weight="fill" /> Needs Revision
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                          <Clock size={14} weight="duotone" /> Pending Review
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Not Submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* Submissions Links & Review Area */}
                {sub ? (
                  <div className="space-y-3">
                    {/* Action Links */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {sub.liveWebsiteUrl && (
                        <a
                          href={sub.liveWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <Globe size={16} weight="bold" />
                          <span>Open Live Website</span>
                          <ArrowSquareOut size={14} />
                        </a>
                      )}

                      {sub.githubUrl && (
                        <a
                          href={sub.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
                        >
                          <GithubLogo size={16} weight="bold" />
                          <span>Open GitHub Repo</span>
                          <ArrowSquareOut size={14} />
                        </a>
                      )}

                      {sub.portfolioUrl && (
                        <a
                          href={sub.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted transition-colors"
                        >
                          <User size={16} weight="bold" className="text-primary" />
                          <span>Open Portfolio</span>
                          <ArrowSquareOut size={14} />
                        </a>
                      )}
                    </div>

                    {/* Student Notes */}
                    {sub.notes && (
                      <p className="text-xs text-muted-foreground bg-background/60 rounded-xl p-2.5 border border-border/40">
                        <strong className="text-foreground">Student Notes:</strong> {sub.notes}
                      </p>
                    )}

                    {/* Existing Trainer Feedback */}
                    {sub.feedback && (
                      <div className="text-xs text-primary bg-primary/5 rounded-xl p-2.5 border border-primary/20 flex items-center gap-2">
                        <ChatCircleText size={16} weight="duotone" />
                        <span>
                          <strong>Feedback given:</strong> {sub.feedback}
                        </span>
                      </div>
                    )}

                    {/* Review Input & Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <Input
                        placeholder="Write feedback message for the student..."
                        className="text-xs h-10 rounded-xl flex-1"
                        value={feedbackMap[sub.id] ?? sub.feedback ?? ""}
                        onChange={(e) =>
                          setFeedbackMap({ ...feedbackMap, [sub.id]: e.target.value })
                        }
                        disabled={isReviewingThis}
                      />

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReview(sub.id, "approved")}
                          disabled={isReviewingThis}
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          <CheckCircle size={16} weight="bold" />
                          {isReviewingThis ? "Saving..." : "Approve"}
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReview(sub.id, "needs_revision")}
                          disabled={isReviewingThis}
                          className="gap-1.5 border-amber-500/40 text-amber-700 dark:text-amber-300 font-semibold"
                        >
                          <XCircle size={16} weight="bold" />
                          Revision
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Student has been assigned the topic &quot;{item.assignedTopic}&quot; and has not submitted yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
