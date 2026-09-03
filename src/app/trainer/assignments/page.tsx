"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { toast } from "@/lib/ui/toast";
import { AutomatedAssignmentsManager } from "@/components/portal/automated-assignments-manager";
import { Sparkle, ClipboardText } from "@phosphor-icons/react";

interface TrainerInfo {
  programSlug: string;
  courseTitle: string;
  designation: string;
  modules: string[];
  currentLevel: string | null;
}

export default function TrainerAssignmentsPage() {
  const [assignments, setAssignments] = useState<
    Array<{ id: string; title: string; description: string; dueDate: string; level?: string }>
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
  const [pageLoading, setPageLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", level: "" });
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  const [selectedModule, setSelectedModule] = useState<string>("all");

  const load = useCallback(() => {
    fetch("/api/trainer/data")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAssignments(d.data.assignments ?? []);
          setSubmissions(d.data.submissions ?? []);
          setTrainer(d.data.trainer ?? null);
          if (d.data.trainer?.modules?.length > 0) {
            setForm((prev) => (prev.level === "" ? { ...prev, level: d.data.trainer.currentLevel ?? d.data.trainer.modules[0] } : prev));
          }
        } else {
          toast.error("Could not load assignments");
        }
      })
      .catch(() => toast.error("Could not load assignments"))
      .finally(() => setPageLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer) return;
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          dueDate: form.dueDate,
          programSlug: trainer.programSlug,
          level: form.level || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Assignment created!", "Students can now see it in their portal.");
        setShowForm(false);
        setForm({ title: "", description: "", dueDate: "", level: trainer.modules[0] ?? "" });
        await load();
      } else {
        toast.error(data.error || data.message || "Failed to create assignment.");
      }
    } catch {
      toast.error("Failed to create assignment.");
    } finally {
      setLoading(false);
    }
  };

  const reviewSubmission = async (id: string, status: "approved" | "needs_revision") => {
    const rawMarks = marksMap[id]?.trim();
    let marksNum: number | undefined = undefined;
    if (rawMarks !== undefined && rawMarks !== "") {
      const parsed = Number(rawMarks);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        toast.warning("Please enter valid marks between 0 and 100");
        return;
      }
      marksNum = parsed;
    }

    setReviewingId(id);
    try {
      const res = await fetch("/api/trainer/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, feedback: feedbackMap[id] ?? "", marks: marksNum }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          status === "approved" ? "Submission approved" : "Sent back for revision",
          "Student notified on portal."
        );
        await load();
      } else {
        toast.error(data.error || data.message || "Review failed.");
      }
    } catch {
      toast.error("Review failed.");
    } finally {
      setReviewingId(null);
    }
  };

  const pendingSubmissions = submissions.filter((s) => s.status === "submitted");
  const [activeTab, setActiveTab] = useState<"automated" | "manual">("automated");
  const hasModules = trainer && trainer.modules.length > 1;
  const isWebDev = !trainer || trainer.programSlug === "web-development";

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title="Assignments & Projects"
        description={
          trainer
            ? `Manage homework, automated projects, and student reviews for ${trainer.courseTitle}.`
            : "Manage homework, automated projects, and student reviews."
        }
      >
        <div className="flex items-center gap-2">
          {hasModules && activeTab === "manual" && (
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-medium"
            >
              <option value="all">All Modules</option>
              {trainer.modules.map((mod) => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          )}
          {activeTab === "manual" && (
            <Button size="lg" onClick={() => setShowForm(!showForm)} disabled={pageLoading}>
              {showForm ? "Cancel" : "+ New Assignment"}
            </Button>
          )}
        </div>
      </PortalPageHeader>

      {/* Tabs Switcher */}
      {isWebDev && (
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/80 w-fit">
          <button
            onClick={() => setActiveTab("automated")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "automated"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkle size={16} weight="fill" className="text-primary" />
            Module 1 Automated Projects
          </button>

          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "manual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardText size={16} weight="bold" />
            Regular Tasks & Homework
          </button>
        </div>
      )}

      {isWebDev && activeTab === "automated" ? (
        <AutomatedAssignmentsManager />
      ) : (
        <div className="space-y-6">

      {showForm && trainer && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 mb-8 space-y-4"
        >
          <h2 className="font-bold text-lg">Create Assignment</h2>
          <p className="text-sm text-muted">Course: {trainer.courseTitle}</p>
          {hasModules && (
            <div>
              <Label className="text-base">Target Module</Label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="mt-2 w-full h-12 rounded-xl border border-border bg-background px-4 text-base"
              >
                {trainer.modules.map((mod) => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1.5">
                Only students enrolled in this module will see this assignment.
              </p>
            </div>
          )}
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
      {pageLoading ? (
        <div className="space-y-4 mb-10">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl border border-border bg-surface/60 animate-pulse"
            />
          ))}
        </div>
      ) : pendingSubmissions.length === 0 ? (
        <div className="mb-10">
          <EmptyState
            title="No pending submissions"
            description="When students submit homework, it will appear here for review."
          />
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {pendingSubmissions.map((sub) => (
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
                disabled={reviewingId === sub.id}
              />
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex items-center">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Marks"
                    className="text-xs h-10 w-24 rounded-xl font-bold text-center pr-8 bg-white"
                    value={marksMap[sub.id] ?? ""}
                    onChange={(e) => setMarksMap({ ...marksMap, [sub.id]: e.target.value })}
                    disabled={reviewingId === sub.id}
                  />
                  <span className="absolute right-2 text-[11px] font-bold text-muted-foreground pointer-events-none">
                    /100
                  </span>
                </div>
                <Button
                  onClick={() => reviewSubmission(sub.id, "approved")}
                  className="gap-2"
                  disabled={reviewingId === sub.id}
                >
                  <CheckCircle size={18} weight="duotone" />
                  {reviewingId === sub.id ? "Saving..." : "Approve"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => reviewSubmission(sub.id, "needs_revision")}
                  className="gap-2"
                  disabled={reviewingId === sub.id}
                >
                  <XCircle size={18} weight="duotone" /> Needs Revision
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-bold mb-4">All Assignments</h2>
      {pageLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl border border-border bg-surface/60 animate-pulse"
            />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create your first assignment so students can start submitting work."
          action={
            trainer ? (
              <Button size="lg" onClick={() => setShowForm(true)}>
                + New Assignment
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted">Due: {a.dueDate}</p>
                </div>
                {a.level && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted bg-surface rounded-full px-2.5 py-1 border border-border">
                    {a.level}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
