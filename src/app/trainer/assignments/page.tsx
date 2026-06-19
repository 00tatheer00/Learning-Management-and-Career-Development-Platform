"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalPageHeader } from "@/components/portal/portal-ui";

interface TrainerInfo {
  programSlug: string;
  courseTitle: string;
  designation: string;
}

export default function TrainerAssignmentsPage() {
  const [assignments, setAssignments] = useState<
    Array<{ id: string; title: string; description: string; dueDate: string }>
  >([]);
  const [submissions, setSubmissions] = useState<
    Array<{
      id: string;
      studentName: string;
      content: string;
      status: string;
      assignmentId: string;
      feedback?: string;
    }>
  >([]);
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  const load = () =>
    fetch("/api/trainer/data")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAssignments(d.data.assignments ?? []);
          setSubmissions(d.data.submissions ?? []);
          setTrainer(d.data.trainer ?? null);
        }
      });

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer) return;
    setLoading(true);
    const res = await fetch("/api/trainer/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, programSlug: trainer.programSlug }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Assignment created! ✓");
      setShowForm(false);
      setForm({ title: "", description: "", dueDate: "" });
      load();
    } else {
      setMessage(data.error || data.message || "Failed to create assignment.");
    }
    setLoading(false);
  };

  const reviewSubmission = async (id: string, status: "approved" | "needs_revision") => {
    await fetch("/api/trainer/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, feedback: feedbackMap[id] ?? "" }),
    });
    setMessage(status === "approved" ? "Marked as approved ✓" : "Sent back for revision");
    load();
  };

  return (
    <div>
      <PortalPageHeader
        title="Assignments"
        description={
          trainer
            ? `Create homework and review submissions for ${trainer.courseTitle}.`
            : "Create homework for students and review their submissions."
        }
      >
        <Button size="lg" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Assignment"}
        </Button>
      </PortalPageHeader>

      {message && (
        <p className="mb-4 text-center font-medium text-emerald-700 bg-emerald-50 rounded-xl p-3">
          {message}
        </p>
      )}

      {showForm && trainer && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-5 sm:p-6 mb-8 space-y-4"
        >
          <h2 className="font-bold text-lg">Create Assignment</h2>
          <p className="text-sm text-muted">Course: {trainer.courseTitle}</p>
          <div>
            <Label className="text-base">Title</Label>
            <Input
              className="mt-2 h-12"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label className="text-base">Instructions</Label>
            <textarea
              className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-base min-h-[100px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label className="text-base">Due Date</Label>
            <Input
              type="date"
              className="mt-2 h-12"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Creating..." : "Create Assignment"}
          </Button>
        </form>
      )}

      <h2 className="text-lg font-bold mb-4">Student Submissions to Review</h2>
      {submissions.filter((s) => s.status === "submitted").length === 0 ? (
        <p className="text-muted mb-8">No pending submissions right now.</p>
      ) : (
        <div className="space-y-4 mb-10">
          {submissions
            .filter((s) => s.status === "submitted")
            .map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5"
              >
                <p className="font-bold">{sub.studentName}</p>
                <p className="text-sm text-muted mb-2">
                  Assignment: {assignments.find((a) => a.id === sub.assignmentId)?.title}
                </p>
                <p className="text-sm mb-4 bg-white rounded-lg p-3 border">{sub.content}</p>
                <textarea
                  placeholder="Write feedback (optional)"
                  className="w-full rounded-lg border px-3 py-2 text-sm mb-3"
                  value={feedbackMap[sub.id] ?? ""}
                  onChange={(e) => setFeedbackMap({ ...feedbackMap, [sub.id]: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={() => reviewSubmission(sub.id, "approved")} className="gap-2">
                    <CheckCircle size={18} weight="duotone" /> Approve
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => reviewSubmission(sub.id, "needs_revision")}
                    className="gap-2"
                  >
                    <XCircle size={18} weight="duotone" /> Needs Revision
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      <h2 className="text-lg font-bold mb-4">All Assignments</h2>
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <p className="text-muted">No assignments yet.</p>
        ) : (
          assignments.map((a) => (
            <div key={a.id} className="rounded-xl border border-border p-4">
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm text-muted">Due: {a.dueDate}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
