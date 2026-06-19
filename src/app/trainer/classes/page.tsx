"use client";

import { useEffect, useState } from "react";
import { VideoCamera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { toast } from "@/lib/ui/toast";

interface LiveSession {
  id: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  programSlug: string;
}

interface TrainerInfo {
  programSlug: string;
  courseTitle: string;
  designation: string;
}

export default function TrainerClassesPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "07:00 PM",
    meetLink: "",
    notes: "",
  });

  const load = () =>
    fetch("/api/trainer/data")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSessions(d.data.sessions ?? []);
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
    try {
      const res = await fetch("/api/trainer/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, programSlug: trainer.programSlug }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Class scheduled!", "Students notified on WhatsApp.");
        setShowForm(false);
        setForm({ title: "", date: "", time: "07:00 PM", meetLink: "", notes: "" });
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

  return (
    <div>
      <PortalPageHeader
        title="Live Classes"
        description={
          trainer
            ? `Schedule online classes for ${trainer.courseTitle}.`
            : "Schedule online classes and share the meeting link with students."
        }
      >
        <Button size="lg" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add New Class"}
        </Button>
      </PortalPageHeader>

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
              <Label className="text-base">Meeting Link (Google Meet / Zoom)</Label>
              <Input
                className="mt-2 h-12"
                value={form.meetLink}
                onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                required
              />
            </div>
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Saving..." : "Save Class"}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-muted text-center py-8">No classes scheduled yet.</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-border bg-background p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-lg">{session.title}</p>
                <p className="text-muted text-sm">
                  {session.date} · {session.time}
                </p>
              </div>
              <Button asChild>
                <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                  <VideoCamera size={18} weight="duotone" /> Open Link
                </a>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
