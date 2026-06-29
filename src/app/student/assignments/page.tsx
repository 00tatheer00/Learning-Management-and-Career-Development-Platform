"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { toast } from "@/lib/ui/toast";

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

  useEffect(() => {
    fetch("/api/student/data")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAssignments(d.data.assignments ?? []);
          setSubmissions(d.data.submissions ?? []);
        }
      });
  }, []);

  const getSubmission = (assignmentId: string) =>
    submissions.find((s) => s.assignmentId === assignmentId);

  const handleSubmit = async (assignmentId: string) => {
    if (!content.trim()) {
      toast.warning("Please write something before submitting.");
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
        toast.success("Assignment submitted!", "Your trainer will review it soon.");
        setContent("");
        setSelectedId(null);
        const refresh = await fetch("/api/student/data");
        const refreshData = await refresh.json();
        if (refreshData.success) setSubmissions(refreshData.data.submissions ?? []);
      } else {
        toast.error(data.message || "Failed to submit.");
      }
    } catch {
      toast.error("Error submitting. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PortalPageHeader
        title="Assignments"
        description="Read the task, write your answer, and click Submit. Your trainer will review it."
      />

      <div className="space-y-4">
        {assignments.map((assignment) => {
          const submission = getSubmission(assignment.id);
          const isOpen = selectedId === assignment.id;

          return (
            <div key={assignment.id} className="rounded-2xl border border-border bg-background p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-lg font-bold">{assignment.title}</h2>
                  <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                    <Clock size={16} weight="duotone" />
                    Due: {assignment.dueDate}
                  </p>
                </div>
                {submission && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    <CheckCircle size={16} weight="duotone" />
                    Submitted
                  </span>
                )}
              </div>

              <p className="text-muted mb-4">{assignment.description}</p>

              {submission ? (
                <div className="rounded-xl bg-surface p-4 space-y-2">
                  <p className="text-sm font-semibold">Your submission:</p>
                  <p className="text-sm">{submission.content}</p>
                  {submission.feedback && (
                    <p className="text-sm text-primary mt-2">
                      <strong>Trainer feedback:</strong> {submission.feedback}
                    </p>
                  )}
                </div>
              ) : isOpen ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-base">Your Answer</Label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={5}
                      placeholder="Write your assignment answer here..."
                      className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
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
    </div>
  );
}
