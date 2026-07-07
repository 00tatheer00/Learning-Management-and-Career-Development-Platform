"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LinkSimple, PlayCircle, Trash, Plus, ShareNetwork } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { getClassProgress } from "@/lib/class-schedule";
import { DRIVE_DOWNLOAD_NOTE } from "@/lib/constants/drive-sharing-guide";
import { toast } from "@/lib/ui/toast";

interface Recording {
  id: string;
  classNumber: number;
  title: string;
  driveUrl: string;
  trainerName: string;
  notes?: string;
}

interface TrainerRecordingsPanelProps {
  programSlug: string;
  courseTitle: string;
}

export function TrainerRecordingsPanel({ programSlug, courseTitle }: TrainerRecordingsPanelProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    classNumber: "",
    title: "",
    driveUrl: "",
    notes: "",
  });

  const progress = getClassProgress(programSlug);
  const suggestedClass =
    progress.completedCount > 0 ? progress.completedCount : progress.todaySlot?.classNumber ?? 1;

  const load = () =>
    fetch("/api/trainer/recordings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRecordings(d.data ?? []);
        else toast.error("Could not load recordings");
      })
      .catch(() => toast.error("Could not load recordings"))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const openNewForm = (classNumber?: number) => {
    const num = classNumber ?? suggestedClass;
    setForm({
      classNumber: String(num),
      title: `Class ${num} Recording`,
      driveUrl: "",
      notes: "",
    });
    setShowForm(true);
  };

  const openEditForm = (recording: Recording) => {
    setForm({
      classNumber: String(recording.classNumber),
      title: recording.title,
      driveUrl: recording.driveUrl,
      notes: recording.notes ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/trainer/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classNumber: Number(form.classNumber),
          title: form.title,
          driveUrl: form.driveUrl,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Recording saved!", "Students can now watch from their portal.");
        setShowForm(false);
        setForm({ classNumber: "", title: "", driveUrl: "", notes: "" });
        await load();
      } else {
        toast.error(data.message || data.error || "Could not save recording");
      }
    } catch {
      toast.error("Could not save recording");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this recording link?")) return;
    const res = await fetch(`/api/trainer/recordings?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Recording removed");
      await load();
    } else {
      toast.error(data.error || "Could not delete");
    }
  };

  return (
    <div>
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title="Class Recordings"
        description={`Upload Google Drive / YouTube links for ${courseTitle}. Students see them in order — Class 1, Class 2, and so on.`}
      >
        <Button size="lg" onClick={() => openNewForm()} disabled={loading}>
          <Plus size={18} weight="bold" />
          Add Recording
        </Button>
      </PortalPageHeader>

      <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-pt-muted">
        <p className="font-semibold text-pt">How to upload</p>
        <ol className="mt-2 list-decimal list-inside space-y-1">
          <li>Upload the class video to <strong className="text-pt">Google Drive</strong> (school Workspace account).</li>
          <li>
            Share with{" "}
            <Link href="/trainer/drive-access" className="text-primary font-semibold underline">
              portal student emails only
            </Link>{" "}
            — Viewer + disable download/print/copy.
          </li>
          <li>Paste the Drive link here with the correct class number.</li>
        </ol>
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">{DRIVE_DOWNLOAD_NOTE}</p>
        <Button variant="secondary" size="sm" asChild className="mt-3 gap-1.5">
          <Link href="/trainer/drive-access">
            <ShareNetwork size={16} />
            Copy all student emails for Drive
          </Link>
        </Button>
        {progress.config && (
          <p className="mt-3 text-xs">
            Schedule: {progress.config.daysLabel} · {progress.config.timeLabel} PKT
          </p>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSave}
          className="mb-8 rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 sm:p-6 space-y-4"
        >
          <h2 className="font-bold text-lg text-pt">Add / Update Recording</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Class Number</Label>
              <Input
                type="number"
                min={1}
                className="mt-2 h-11"
                value={form.classNumber}
                onChange={(e) => setForm({ ...form, classNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                className="mt-2 h-11"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Class 1 Recording"
                required
              />
            </div>
          </div>
          <div>
            <Label>Drive / YouTube Link</Label>
            <Input
              type="url"
              className="mt-2 h-11"
              value={form.driveUrl}
              onChange={(e) => setForm({ ...form, driveUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              required
            />
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Input
              className="mt-2 h-11"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Topics covered in this class"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Recording"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-pt bg-surface/60 animate-pulse" />
          ))}
        </div>
      ) : recordings.length === 0 ? (
        <EmptyState
          title="No recordings yet"
          description="After each live class, paste your Drive link here so students can rewatch."
          action={
            <Button size="lg" onClick={() => openNewForm()}>
              <Plus size={18} />
              Add Class 1 Recording
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-pt bg-background p-4 shadow-sm"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <PlayCircle size={22} weight="duotone" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    Class {recording.classNumber}
                  </p>
                  <p className="font-semibold text-pt truncate">{recording.title}</p>
                  <a
                    href={recording.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <LinkSimple size={12} />
                    Open link
                  </a>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => openEditForm(recording)}>
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(recording.id)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
