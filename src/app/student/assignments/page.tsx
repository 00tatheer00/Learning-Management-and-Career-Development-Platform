"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, ArrowSquareOut, GraduationCap } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
  status: string;
  feedback?: string;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/data")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAssignments(d.data.assignments ?? []);
          setSubmissions(d.data.submissions ?? []);
        } else {
          toast.error(STUDENT_UR.toasts.serverError);
        }
      })
      .catch(() => {
        toast.error(STUDENT_UR.toasts.networkError);
      })
      .finally(() => setPageLoading(false));
  }, []);

  const getSubmission = (assignmentId: string) =>
    submissions.find((s) => s.assignmentId === assignmentId);

  const handleSubmit = async (assignmentId: string) => {
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
        const refresh = await fetch("/api/student/data");
        const refreshData = await refresh.json();
        if (refreshData.success) setSubmissions(refreshData.data.submissions ?? []);
      } else {
        toast.error(data.message || STUDENT_UR.toasts.assignmentFailed);
      }
    } catch {
      toast.error(STUDENT_UR.toasts.assignmentError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StudentMarkSectionSeen section="assignments" />
      <PortalPageHeader
        eyebrow="Homework"
        title="Assignments"
        description="Read the task, write your answer, and submit. Your trainer will review it."
      />

      {/* Google Classroom Banner */}
      <div className="portal-card rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 mb-6">
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

      {pageLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-pt bg-pt-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Your trainer will post assignments here when they are ready."
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const submission = getSubmission(assignment.id);
            const isOpen = selectedId === assignment.id;

            return (
              <div key={assignment.id} className="portal-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-pt">{assignment.title}</h2>
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
                    <p className="text-sm font-semibold text-pt">Your submission:</p>
                    <p className="text-sm text-pt-secondary">{submission.content}</p>
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
                        onClick={() => handleSubmit(assignment.id)}
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
  );
}
