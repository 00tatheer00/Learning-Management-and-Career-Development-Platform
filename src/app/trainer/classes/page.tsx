"use client";

import { useEffect, useState } from "react";
import { LinkSimple, PencilSimple, VideoCamera, CheckCircle, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { toast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";
import {
  getSessionLifecycleState,
  sortLiveSessionsForDisplay,
} from "@/lib/sessions/join-window";

interface LiveSession {
  id: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  roomType: "portal" | "meet";
  programSlug: string;
  level?: string;
  notes?: string;
}

interface TrainerInfo {
  programSlug: string;
  courseTitle: string;
  designation: string;
  modules: string[];
  currentLevel: string | null;
}

const emptyForm = {
  title: "",
  date: "",
  time: "07:00 PM",
  meetLink: "",
  notes: "",
  level: "",
};

export default function TrainerClassesPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLink, setEditLink] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [selectedModule, setSelectedModule] = useState<string>("all");

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const load = () =>
    fetch("/api/trainer/data")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSessions(d.data.sessions ?? []);
          setTrainer(d.data.trainer ?? null);
          if (d.data.trainer?.modules?.length > 0 && form.level === "") {
            setForm((prev) => ({ ...prev, level: d.data.trainer.currentLevel ?? d.data.trainer.modules[0] }));
          }
        } else {
          toast.error("Could not load classes");
        }
      })
      .catch(() => toast.error("Could not load classes"))
      .finally(() => setPageLoading(false));

  useEffect(() => {
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter sessions by selected module
  const filteredSessions = selectedModule === "all"
    ? sessions
    : sessions.filter((s) => s.level === selectedModule);
  const sortedSessions = sortLiveSessionsForDisplay(filteredSessions, now);

  const hasModules = trainer && trainer.modules.length > 1;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer) return;
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          date: form.date,
          time: form.time,
          meetLink: form.meetLink,
          roomType: "meet",
          programSlug: trainer.programSlug,
          level: form.level || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Class scheduled!", "Students can join from their portal at class time.");
        setShowForm(false);
        setForm({ ...emptyForm, level: trainer.modules[0] ?? "" });
        load();
      } else {
        toast.error(data.message || data.error || "Failed to create class.");
      }
    } catch {
      toast.error("Error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLink = async (sessionId: string) => {
    if (!editLink.trim()) {
      toast.error("Paste your Google Meet link first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/trainer/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetLink: editLink }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Meet link saved!", "Students will see Join Class when it's time.");
        setEditingId(null);
        setEditLink("");
        load();
      } else {
        toast.error(data.message || data.error || "Could not save link.");
      }
    } catch {
      toast.error("Error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (sessionId: string) => {
    setDeletingId(sessionId);
    try {
      const res = await fetch(`/api/trainer/sessions/${sessionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Class deleted!", "This class has been removed for you and all students.");
        setConfirmDeleteId(null);
        load();
      } else {
        toast.error(data.message || data.error || "Could not delete class.");
      }
    } catch {
      toast.error("Error. Try again.");
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div>
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title="Live Classes"
        description={
          trainer
            ? `Schedule classes for ${trainer.courseTitle}. Add a Google Meet link — students join from their portal.`
            : "Schedule live classes for your students."
        }
      >
        <div className="flex items-center gap-2">
          {hasModules && (
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
          <Button size="lg" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Schedule Class"}
          </Button>
        </div>
      </PortalPageHeader>

      <p className="mb-6 text-sm rounded-xl border border-primary/20 bg-primary/5 p-4 text-muted">
        <span className="font-semibold text-foreground">How it works:</span> Create a class with
        date, time & Google Meet link. At class time, students open their portal and tap{" "}
        <strong className="text-foreground">Join Class</strong> — they enter your Meet directly.
        You can update the link anytime before class.
      </p>

      {showForm && trainer && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 mb-8 space-y-4"
        >
          <h2 className="font-bold text-lg">Schedule a New Class</h2>
          <p className="text-sm text-muted">Course: {trainer.courseTitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hasModules && (
              <div className="sm:col-span-2">
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
                  Only students enrolled in this module will see this class.
                </p>
              </div>
            )}
            <div className="sm:col-span-2">
              <Label className="text-base">Class Title</Label>
              <Input
                className="mt-2 h-12"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. HTML & CSS Live Class"
                required
              />
            </div>
            <div>
              <Label className="text-base">Date</Label>
              <Input
                type="date"
                className="mt-2 h-12"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="text-base">Time</Label>
              <Input
                className="mt-2 h-12"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="07:00 PM"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-base flex items-center gap-2">
                <LinkSimple size={18} weight="duotone" />
                Google Meet Link
              </Label>
              <Input
                className="mt-2 h-12"
                value={form.meetLink}
                onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                placeholder="https://meet.google.com/abc-defg-hij"
                required
              />
              <p className="text-xs text-muted mt-1.5">
                Create a meeting in Google Calendar or meet.google.com, then paste the link here.
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-base">Notes for students (optional)</Label>
              <Input
                className="mt-2 h-12"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Bring your laptop charged"
              />
            </div>
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Saving..." : "Save Class"}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {pageLoading ? (
          <div className="h-32 rounded-2xl border border-border bg-surface/60 animate-pulse" />
        ) : sessions.length === 0 ? (
          <EmptyState
            title="No classes scheduled"
            description='Tap "Schedule Class" to add your first live session.'
          />
        ) : (
          sortedSessions.map((session) => {
            const hasLink = Boolean(session.meetLink?.trim()) || session.roomType === "portal";
            const isEditing = editingId === session.id;
            const lifecycle = getSessionLifecycleState({
              sessionDate: session.date,
              sessionTime: session.time,
              programSlug: session.programSlug,
              hasJoinLink: hasLink,
              now,
            });
            const isDone = lifecycle.phase === "done";

            return (
              <div
                key={session.id}
                className={cn(
                  "rounded-2xl border border-border bg-background p-5 space-y-4",
                  isDone && "bg-surface/50 opacity-90"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-lg">{session.title}</p>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase rounded-full px-2 py-0.5",
                          lifecycle.badgeClassName
                        )}
                      >
                        {lifecycle.badgeLabel}
                      </span>
                      {session.level && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted bg-surface rounded-full px-2 py-0.5 border border-border">
                          {session.level}
                        </span>
                      )}
                    </div>
                    <p className="text-muted text-sm">
                      {session.date} · {session.time}
                    </p>
                    {isDone && (
                      <p className="mt-2 text-sm text-muted flex items-center gap-1.5">
                        <CheckCircle size={16} weight="fill" className="text-slate-500 shrink-0" />
                        Class completed — students see this as Done in their portal.
                      </p>
                    )}
                    {hasLink && session.roomType === "meet" && !isEditing && !isDone && (
                      <p className="text-xs text-muted mt-2 truncate max-w-md">
                        {session.meetLink}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {session.roomType === "meet" && hasLink && !isEditing && lifecycle.canTrainerOpenMeet && (
                      <Button asChild className="shrink-0">
                        <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                          <VideoCamera size={18} weight="duotone" /> Open Meet
                        </a>
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-600 shrink-0 h-10 w-10 rounded-xl transition-colors"
                      title="Delete class"
                      onClick={() => setConfirmDeleteId(confirmDeleteId === session.id ? null : session.id)}
                    >
                      <Trash size={18} weight="duotone" />
                    </Button>
                  </div>
                </div>

                {confirmDeleteId === session.id && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      Are you sure you want to delete &quot;{session.title}&quot;?
                    </p>
                    <p className="text-xs text-muted">
                      This class will be permanently removed for you and all students in their portal.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-red-600 text-white hover:bg-red-700"
                        disabled={deletingId === session.id}
                        onClick={() => handleDeleteClass(session.id)}
                      >
                        {deletingId === session.id ? "Deleting..." : "Yes, Delete Class"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === session.id}
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {session.roomType === "meet" && lifecycle.canTrainerEditLink && (
                  <div className="rounded-xl border border-border bg-surface p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Google Meet Link</Label>
                        <Input
                          className="h-11"
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          placeholder="https://meet.google.com/..."
                          autoFocus
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            disabled={loading}
                            onClick={() => handleSaveLink(session.id)}
                          >
                            {loading ? "Saving..." : "Save Link"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditLink("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(session.id);
                          setEditLink(session.meetLink ?? "");
                        }}
                      >
                        <PencilSimple size={16} weight="duotone" />
                        {hasLink ? "Update Meet Link" : "Add Meet Link"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

