"use client";

import { useEffect, useState } from "react";
import { LinkSimple, PencilSimple, VideoCamera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { toast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

interface LiveSession {
  id: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  roomType: "portal" | "meet";
  programSlug: string;
  notes?: string;
}

interface TrainerInfo {
  programSlug: string;
  courseTitle: string;
  designation: string;
}

const emptyForm = {
  title: "",
  date: "",
  time: "07:00 PM",
  meetLink: "",
  notes: "",
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

  const load = () =>
    fetch("/api/trainer/data")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSessions(d.data.sessions ?? []);
          setTrainer(d.data.trainer ?? null);
        } else {
          toast.error("Could not load classes");
        }
      })
      .catch(() => toast.error("Could not load classes"))
      .finally(() => setPageLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer) return;
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          roomType: "meet",
          programSlug: trainer.programSlug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Class scheduled!", "Students can join from their portal at class time.");
        setShowForm(false);
        setForm(emptyForm);
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
        <Button size="lg" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Schedule Class"}
        </Button>
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
          sessions.map((session) => {
            const hasLink = Boolean(session.meetLink?.trim()) || session.roomType === "portal";
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                className="rounded-2xl border border-border bg-background p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-lg">{session.title}</p>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase rounded-full px-2 py-0.5",
                          hasLink
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        {hasLink ? "Link ready" : "Link needed"}
                      </span>
                    </div>
                    <p className="text-muted text-sm">
                      {session.date} · {session.time}
                    </p>
                    {hasLink && session.roomType === "meet" && !isEditing && (
                      <p className="text-xs text-muted mt-2 truncate max-w-md">
                        {session.meetLink}
                      </p>
                    )}
                  </div>

                  {session.roomType === "meet" && hasLink && !isEditing && (
                    <Button asChild className="shrink-0">
                      <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                        <VideoCamera size={18} weight="duotone" /> Open Meet
                      </a>
                    </Button>
                  )}
                </div>

                {session.roomType === "meet" && (
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
