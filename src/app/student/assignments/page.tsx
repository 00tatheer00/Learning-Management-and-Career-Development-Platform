"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  ArrowSquareOut,
  GraduationCap,
  Sparkle,
  Globe,
  GithubLogo,
  User,
  ChatCircleText,
  WarningCircle,
  PencilSimple,
  Check,
  ListChecks,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { toast } from "@/lib/ui/toast";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";
import { StudentMarkSectionSeen } from "@/components/portal/student-mark-section-seen";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  content: string;
  liveWebsiteUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  assignedTopic?: string;
  notes?: string;
  status: string;
  feedback?: string;
  marks?: number | null;
  submittedAt?: string;
}

interface TopicRequirement {
  id: string;
  title: string;
  description: string;
}

interface TopicDetails {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  suggestedPages: string[];
  keyFeatures: string[];
}

interface AutomatedAssignmentData {
  eligible: boolean;
  assignment?: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
  };
  topicAssignment?: {
    id: string;
    topic: string;
    topicCategory?: string;
    topicDetails?: TopicDetails;
    assignedAt: string;
  };
  requirements?: TopicRequirement[];
  submission?: Submission | null;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [programSlug, setProgramSlug] = useState<string | null>(null);
  const [studentLevel, setStudentLevel] = useState<string | null>(null);

  // Automated assignment state
  const [automatedData, setAutomatedData] = useState<AutomatedAssignmentData | null>(null);
  const [isEditingAutomated, setIsEditingAutomated] = useState(false);
  const [autoForm, setAutoForm] = useState({
    liveWebsiteUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    notes: "",
  });

  const loadStudentData = async () => {
    try {
      const [resData, resTopic] = await Promise.all([
        fetch("/api/student/data").then((r) => r.json()),
        fetch("/api/student/topic-assignment").then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (resData.success) {
        setAssignments(resData.data.assignments ?? []);
        setSubmissions(resData.data.submissions ?? []);
        setProgramSlug(resData.data.programSlug ?? null);
        setStudentLevel(resData.data.level ?? null);
      }

      if (resTopic.success && resTopic.data) {
        setAutomatedData(resTopic.data);
        if (resTopic.data.submission) {
          const s = resTopic.data.submission;
          setAutoForm({
            liveWebsiteUrl: s.liveWebsiteUrl || "",
            githubUrl: s.githubUrl || "",
            portfolioUrl: s.portfolioUrl || "",
            notes: s.notes || "",
          });
        }
      }
    } catch {
      toast.error(STUDENT_UR.toasts.networkError);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    void loadStudentData();
  }, []);

  const getSubmission = (assignmentId: string) =>
    submissions.find((s) => s.assignmentId === assignmentId);

  const handleStandardSubmit = async (assignmentId: string) => {
    if (!content.trim()) {
      toast.warning(STUDENT_UR.toasts.assignmentWriteSomething);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/student/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, content }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(STUDENT_UR.toasts.assignmentSubmitted, STUDENT_UR.toasts.assignmentSubmittedDesc);
        setContent("");
        setSelectedId(null);
        await loadStudentData();
      } else {
        toast.error(data.message || STUDENT_UR.toasts.assignmentFailed);
      }
    } catch {
      toast.error(STUDENT_UR.toasts.assignmentError);
    } finally {
      setLoading(false);
    }
  };

  const handleAutomatedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!automatedData?.assignment?.id) return;

    if (!autoForm.liveWebsiteUrl.trim()) {
      toast.warning("Please enter your Deployed Live Website URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/student/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: automatedData.assignment.id,
          liveWebsiteUrl: autoForm.liveWebsiteUrl.trim(),
          githubUrl: autoForm.githubUrl.trim(),
          portfolioUrl: autoForm.portfolioUrl.trim(),
          assignedTopic: automatedData.topicAssignment?.topic,
          notes: autoForm.notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Assignment Submitted Successfully!", "Your trainer will review and grade your deployed project.");
        setIsEditingAutomated(false);
        await loadStudentData();
      } else {
        toast.error(data.message || data.error || "Submission failed. Please check your URL.");
      }
    } catch {
      toast.error("Submission failed due to a network error.");
    } finally {
      setLoading(false);
    }
  };

  const showGoogleClassroom =
    (!programSlug || programSlug === "web-development") &&
    (!studentLevel || studentLevel.trim() === "HTML & CSS");

  const topic = automatedData?.topicAssignment;
  const topicDetails = topic?.topicDetails;
  const automatedSubmission = automatedData?.submission;

  return (
    <div className="space-y-8">
      <StudentMarkSectionSeen section="assignments" />
      <PortalPageHeader
        eyebrow="Web Development Capstone"
        title="Module 1 Final Project & Assignments"
        description="Build your assigned website topic, link your personal developer portfolio, and submit your live project for review."
      />

      {/* Google Classroom Banner */}
      {showGoogleClassroom && (
        <div className="portal-card rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <GraduationCap size={28} weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-pt">Google Classroom</h2>
                <p className="text-sm text-pt-muted mt-1 max-w-xl leading-relaxed">
                  Access your class assignments, view course tasks, and submit your homework directly on Google Classroom.
                </p>
              </div>
            </div>
            <a
              href="https://classroom.google.com/c/ODcwODkwODU5Mjk2?cjc=wikqarqt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              Go to Google Classroom
              <ArrowSquareOut size={18} weight="bold" />
            </a>
          </div>
        </div>
      )}

      {/* ─── AUTOMATED TOPIC ASSIGNMENT SECTION (WEB DEV MODULE 1) ─── */}
      {automatedData?.eligible && topic && (
        <div className="portal-card rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-primary/5 via-card to-card p-6 sm:p-8 shadow-lg space-y-6">
          {/* Header & Assigned Topic Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border/60">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
                <Sparkle size={14} weight="fill" />
                <span>Automated Project Topic Allocation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{topicDetails?.icon || "🌐"}</span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {topic.topicCategory || "Web Development"} Project
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {topic.topic}
                  </h2>
                </div>
              </div>
            </div>

            {/* Submission Status & Marks Badge */}
            <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
              {automatedSubmission?.marks != null && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-extrabold bg-primary/15 text-primary border border-primary/30 shadow-sm">
                  <Sparkle size={16} weight="fill" />
                  Marks: {automatedSubmission.marks} / 100
                </span>
              )}
              {automatedSubmission ? (
                automatedSubmission.status === "approved" ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle size={20} weight="fill" />
                    Approved & Verified
                  </span>
                ) : automatedSubmission.status === "needs_revision" ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <WarningCircle size={20} weight="fill" />
                    Needs Revision
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    <Clock size={20} weight="duotone" />
                    Submitted — In Review
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Clock size={18} weight="duotone" />
                  Not Submitted Yet
                </span>
              )}
            </div>
          </div>

          {/* Topic Description & Scope */}
          <div className="rounded-2xl bg-muted/40 p-5 border border-border/50 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ListChecks size={18} className="text-primary" />
              Project Objective & Suggested Scope
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {topicDetails?.description || automatedData.assignment?.description}
            </p>

            {topicDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
                <div className="bg-background/80 rounded-xl p-3 border border-border/40">
                  <span className="font-semibold text-foreground">Suggested Pages / Views:</span>
                  <p className="text-muted-foreground mt-1">{topicDetails.suggestedPages.join(" • ")}</p>
                </div>
                <div className="bg-background/80 rounded-xl p-3 border border-border/40">
                  <span className="font-semibold text-foreground">Recommended Key Features:</span>
                  <p className="text-muted-foreground mt-1">{topicDetails.keyFeatures.join(" • ")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Technical Requirements Checklist */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle size={18} className="text-primary" weight="bold" />
              Mandatory Technical & Design Requirements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {automatedData.requirements?.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-border/60 bg-card/60 p-3.5 space-y-1 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>{req.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-4">{req.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Guidelines Note */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
              🚀
            </div>
            <div className="space-y-1 text-sm">
              <h4 className="font-bold text-foreground">Project Submission Guidelines</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Deploy your assigned project website on <strong>Vercel</strong>, <strong>Netlify</strong>, or <strong>GitHub Pages</strong>. Simply submit your live deployed URL below. Your trainer will evaluate your project and assign marks out of <strong>100</strong>.
              </p>
            </div>
          </div>

          {/* ─── SUBMISSION SECTION ─── */}
          {automatedSubmission && !isEditingAutomated ? (
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <h3 className="font-bold text-lg text-foreground">Your Submitted Project</h3>
                  <p className="text-xs text-muted-foreground">
                    Submitted on: {new Date(automatedSubmission.submittedAt || Date.now()).toLocaleDateString()} at{" "}
                    {new Date(automatedSubmission.submittedAt || Date.now()).toLocaleTimeString()}
                  </p>
                </div>
                {automatedSubmission.status !== "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setIsEditingAutomated(true)}
                  >
                    <PencilSimple size={16} />
                    Edit / Resubmit Links
                  </Button>
                )}
              </div>

              {/* Submitted Links Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {automatedSubmission.liveWebsiteUrl && (
                  <a
                    href={automatedSubmission.liveWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Globe size={20} className="text-primary shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-muted-foreground">Live Website</p>
                        <p className="text-xs font-bold text-primary truncate">Open Website</p>
                      </div>
                    </div>
                    <ArrowSquareOut size={16} className="text-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                )}

                {automatedSubmission.githubUrl && (
                  <a
                    href={automatedSubmission.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <GithubLogo size={20} className="text-foreground shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-muted-foreground">GitHub Repo</p>
                        <p className="text-xs font-bold text-foreground truncate">View Code</p>
                      </div>
                    </div>
                    <ArrowSquareOut size={16} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                )}

                {automatedSubmission.portfolioUrl && (
                  <a
                    href={automatedSubmission.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <User size={20} className="text-foreground shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-muted-foreground">Personal Portfolio</p>
                        <p className="text-xs font-bold text-foreground truncate">View Portfolio</p>
                      </div>
                    </div>
                    <ArrowSquareOut size={16} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                )}
              </div>

              {automatedSubmission.notes && (
                <div className="rounded-xl bg-muted/30 p-3 border border-border/50 text-xs">
                  <span className="font-semibold text-foreground">Your Notes:</span>{" "}
                  <span className="text-muted-foreground">{automatedSubmission.notes}</span>
                </div>
              )}

              {/* Trainer Evaluation & Feedback Box */}
              {(automatedSubmission.feedback || automatedSubmission.marks != null) && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <ChatCircleText size={18} weight="duotone" />
                      Trainer Evaluation & Feedback:
                    </div>
                    {automatedSubmission.marks != null && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-xs font-extrabold bg-primary text-primary-foreground shadow-sm">
                        <Sparkle size={14} weight="fill" />
                        Score: {automatedSubmission.marks} / 100
                      </span>
                    )}
                  </div>
                  {automatedSubmission.feedback && (
                    <p className="text-sm text-foreground leading-relaxed">{automatedSubmission.feedback}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleAutomatedSubmit} className="rounded-2xl border border-primary/30 bg-card p-5 sm:p-6 space-y-5">
              <div className="border-b border-border pb-3">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Check size={20} className="text-primary" />
                  {isEditingAutomated ? "Edit Assignment Submission" : "Submit Your Assignment"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Paste your live deployed website link below. Your trainer will test the live project and grade it out of 100 marks.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5 mb-1.5">
                    <Globe size={16} className="text-primary" />
                    Deployed Live Website Link *
                  </Label>
                  <Input
                    placeholder="https://your-project.vercel.app (or Netlify / GitHub Pages)"
                    value={autoForm.liveWebsiteUrl}
                    onChange={(e) => setAutoForm({ ...autoForm, liveWebsiteUrl: e.target.value })}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Enter your live deployed project link. Only this live link is required for submission.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                      <GithubLogo size={16} />
                      GitHub Repository URL (Optional)
                    </Label>
                    <Input
                      placeholder="https://github.com/username/repo"
                      value={autoForm.githubUrl}
                      onChange={(e) => setAutoForm({ ...autoForm, githubUrl: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                      <User size={16} />
                      Personal Portfolio URL (Optional)
                    </Label>
                    <Input
                      placeholder="https://your-portfolio.com"
                      value={autoForm.portfolioUrl}
                      onChange={(e) => setAutoForm({ ...autoForm, portfolioUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5 mb-1.5">
                    <ChatCircleText size={16} className="text-primary" />
                    Student Notes / Remarks (Optional)
                  </Label>
                  <textarea
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[70px]"
                    placeholder="Mention any custom features, animations, or notes for the trainer..."
                    value={autoForm.notes}
                    onChange={(e) => setAutoForm({ ...autoForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button size="lg" type="submit" disabled={loading} className="gap-2 font-semibold">
                  <CheckCircle size={18} weight="bold" />
                  {loading ? "Submitting..." : isEditingAutomated ? "Update Submission" : "Submit Assignment"}
                </Button>
                {isEditingAutomated && (
                  <Button size="lg" variant="ghost" onClick={() => setIsEditingAutomated(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* ─── STANDARD / OTHER ASSIGNMENTS SECTION ─── */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-pt">All Course Homework & Tasks</h2>

        {pageLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl border border-pt bg-pt-muted/50 animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 && !automatedData?.eligible ? (
          <EmptyState
            title="No assignments yet"
            description="Your trainer will post assignments here when they are ready."
          />
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              // Skip duplicate display if this is the automated assignment we already rendered above
              if (automatedData?.assignment?.id === assignment.id) {
                return null;
              }

              const submission = getSubmission(assignment.id);
              const isOpen = selectedId === assignment.id;

              return (
                <div key={assignment.id} className="portal-card rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-pt">{assignment.title}</h3>
                      <p className="text-sm text-pt-muted flex items-center gap-1.5 mt-1">
                        <Clock size={16} weight="duotone" />
                        Due: {assignment.dueDate}
                      </p>
                    </div>
                    {submission && (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold student-badge-live px-3 py-1 rounded-full">
                        <CheckCircle size={16} weight="duotone" />
                        Submitted
                      </span>
                    )}
                  </div>

                  <p className="text-pt-muted mb-4 leading-relaxed">{assignment.description}</p>

                  {submission ? (
                    <div className="rounded-xl bg-pt-muted border border-pt-subtle p-4 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-sm font-semibold text-pt">Your submission:</p>
                        {submission.marks != null && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-extrabold bg-primary/20 text-primary border border-primary/30">
                            Marks: {submission.marks} / 100
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-pt-secondary whitespace-pre-wrap">{submission.content}</p>
                      {submission.feedback && (
                        <p className="text-sm text-primary mt-2">
                          <strong>Trainer feedback:</strong> {submission.feedback}
                        </p>
                      )}
                    </div>
                  ) : isOpen ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-base text-pt">Your Answer</Label>
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={5}
                          placeholder="Write your assignment answer here..."
                          className="mt-2 w-full rounded-xl border border-pt bg-pt-surface px-4 py-3 text-base text-pt focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                          size="lg"
                          onClick={() => handleStandardSubmit(assignment.id)}
                          disabled={loading}
                        >
                          {loading ? "Submitting..." : "Submit Assignment"}
                        </Button>
                        <Button size="lg" variant="secondary" onClick={() => setSelectedId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="lg" onClick={() => { setSelectedId(assignment.id); setContent(""); }}>
                      Start Assignment
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
