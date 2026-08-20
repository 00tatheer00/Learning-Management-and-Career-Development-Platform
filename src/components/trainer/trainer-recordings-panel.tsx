"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  LinkSimple,
  PlayCircle,
  Trash,
  Plus,
  ShareNetwork,
  SquaresFour,
  Sparkle,
  PencilSimple,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { DRIVE_DOWNLOAD_NOTE } from "@/lib/constants/drive-sharing-guide";
import { toast } from "@/lib/ui/toast";
import { cn } from "@/lib/utils";

interface Recording {
  id: string;
  classNumber: number;
  level?: string;
  title: string;
  driveUrl: string;
  trainerName: string;
  notes?: string;
}

interface TrainerRecordingsPanelProps {
  programSlug: string;
  courseTitle: string;
  modules?: string[];
  initialModule?: string;
}

export function TrainerRecordingsPanel({
  programSlug,
  courseTitle,
  modules = ["HTML & CSS", "JavaScript", "React", "Backend + Database"],
  initialModule = "all",
}: TrainerRecordingsPanelProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecording, setEditingRecording] = useState<Recording | null>(null);

  // Tab filter: "all" or specific module name
  const [activeTab, setActiveTab] = useState<string>(initialModule || "all");

  const [form, setForm] = useState({
    classNumber: "",
    level: modules[0] || "HTML & CSS",
    title: "",
    driveUrl: "",
    notes: "",
  });

  const load = () =>
    fetch("/api/trainer/recordings?module=all")
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

  // Filter recordings according to the active tab
  const filteredRecordings = useMemo(() => {
    if (activeTab === "all") return recordings;
    const normTab = activeTab.toLowerCase().trim();
    return recordings.filter((r) => {
      const recLevel = (r.level || modules[0] || "").toLowerCase().trim();
      return recLevel === normTab;
    });
  }, [recordings, activeTab, modules]);

  // Compute counts per module
  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recordings.length };
    modules.forEach((mod) => {
      const norm = mod.toLowerCase().trim();
      counts[mod] = recordings.filter(
        (r) => (r.level || modules[0] || "").toLowerCase().trim() === norm
      ).length;
    });
    return counts;
  }, [recordings, modules]);

  // Calculate suggested next class number for a specific module
  const getSuggestedClassForModule = (modName: string) => {
    const norm = modName.toLowerCase().trim();
    const modRecordings = recordings.filter(
      (r) => (r.level || modules[0] || "").toLowerCase().trim() === norm
    );
    const maxNum =
      modRecordings.length > 0
        ? Math.max(...modRecordings.map((r) => r.classNumber))
        : 0;
    return maxNum + 1;
  };

  const openNewForm = (targetModule?: string) => {
    const chosenMod =
      targetModule || (activeTab !== "all" ? activeTab : modules[0]) || "HTML & CSS";
    const nextClass = getSuggestedClassForModule(chosenMod);
    setEditingRecording(null);
    setForm({
      classNumber: String(nextClass),
      level: chosenMod,
      title: `Class ${nextClass} Recording`,
      driveUrl: "",
      notes: "",
    });
    setShowForm(true);
  };

  const openEditForm = (recording: Recording) => {
    setEditingRecording(recording);
    setForm({
      classNumber: String(recording.classNumber),
      level: recording.level || modules[0] || "HTML & CSS",
      title: recording.title,
      driveUrl: recording.driveUrl,
      notes: recording.notes ?? "",
    });
    setShowForm(true);
  };

  const handleModuleChangeInForm = (newMod: string) => {
    if (!editingRecording) {
      const nextClass = getSuggestedClassForModule(newMod);
      setForm((prev) => ({
        ...prev,
        level: newMod,
        classNumber: String(nextClass),
        title: `Class ${nextClass} Recording`,
      }));
    } else {
      setForm((prev) => ({ ...prev, level: newMod }));
    }
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
          level: form.level,
          title: form.title,
          driveUrl: form.driveUrl,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          editingRecording ? "Recording updated!" : "Recording saved!",
          `Saved for ${form.level} (Class ${form.classNumber}). Students in this module can now watch.`
        );
        setShowForm(false);
        setEditingRecording(null);
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

  const handleDelete = async (id: string, title: string, level?: string) => {
    if (!confirm(`Remove "${title}" (${level || "recording"})?`)) return;
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
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title="Class Recordings"
        description={`Upload and manage Google Drive / YouTube links for ${courseTitle}. Each module's recordings are cleanly isolated so Class 1 of Module 2 will never overwrite Class 1 of Module 1.`}
      >
        <Button size="lg" onClick={() => openNewForm()} disabled={loading} className="gap-2">
          <Plus size={18} weight="bold" />
          Add Recording
        </Button>
      </PortalPageHeader>

      {/* Module Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border",
            activeTab === "all"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-surface/80 hover:bg-surface text-pt-muted hover:text-pt border-pt/60"
          )}
        >
          <SquaresFour size={15} weight={activeTab === "all" ? "fill" : "regular"} />
          <span>All Modules</span>
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-md text-[10px] font-extrabold",
              activeTab === "all"
                ? "bg-white/20 text-white"
                : "bg-pt-muted/20 text-pt-muted"
            )}
          >
            {moduleCounts.all || 0}
          </span>
        </button>

        {modules.map((mod) => {
          const isActive = activeTab === mod;
          const count = moduleCounts[mod] || 0;
          return (
            <button
              key={mod}
              type="button"
              onClick={() => setActiveTab(mod)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface/80 hover:bg-surface text-pt-muted hover:text-pt border-pt/60"
              )}
            >
              <Sparkle size={13} weight={isActive ? "fill" : "regular"} />
              <span>{mod}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-md text-[10px] font-extrabold",
                  isActive ? "bg-white/20 text-white" : "bg-pt-muted/20 text-pt-muted"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Guide Card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-pt-muted">
        <p className="font-semibold text-pt">How to upload &amp; isolate module recordings</p>
        <ol className="mt-2 list-decimal list-inside space-y-1">
          <li>
            Upload the class video to <strong className="text-pt">Google Drive</strong>.
          </li>
          <li>
            Share with students enrolled in{" "}
            <strong className="text-primary font-bold">
              {activeTab === "all" ? "the corresponding module" : activeTab}
            </strong>{" "}
            — Viewer permission (Disable download/print/copy).
          </li>
          <li>
            Select the exact <strong className="text-pt">Module Name</strong> and Class Number
            when saving.
          </li>
        </ol>
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">{DRIVE_DOWNLOAD_NOTE}</p>
        <Button variant="secondary" size="sm" asChild className="mt-3 gap-1.5">
          <Link href="/trainer/drive-access">
            <ShareNetwork size={16} />
            Copy all student emails for Drive
          </Link>
        </Button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2 border-b border-primary/15 pb-3">
            <div>
              <h2 className="font-bold text-lg text-pt">
                {editingRecording ? "Edit Class Recording" : "Add New Class Recording"}
              </h2>
              <p className="text-xs text-pt-muted mt-0.5">
                Ensure the correct target module is selected below.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30">
              {form.level}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="font-semibold text-xs text-pt">Target Module</Label>
              <select
                className="mt-2 flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-medium"
                value={form.level}
                onChange={(e) => handleModuleChangeInForm(e.target.value)}
                required
              >
                {modules.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="font-semibold text-xs text-pt">Class Number</Label>
              <Input
                type="number"
                min={1}
                className="mt-2 h-11 rounded-xl"
                value={form.classNumber}
                onChange={(e) => setForm({ ...form, classNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label className="font-semibold text-xs text-pt">Recording Title</Label>
              <Input
                className="mt-2 h-11 rounded-xl"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={`Class ${form.classNumber || 1} Recording`}
                required
              />
            </div>
          </div>

          <div>
            <Label className="font-semibold text-xs text-pt">Google Drive / YouTube Link</Label>
            <Input
              type="url"
              className="mt-2 h-11 rounded-xl"
              value={form.driveUrl}
              onChange={(e) => setForm({ ...form, driveUrl: e.target.value })}
              placeholder="https://drive.google.com/file/d/... or https://youtu.be/..."
              required
            />
          </div>

          <div>
            <Label className="font-semibold text-xs text-pt">Notes / Topics Covered (Optional)</Label>
            <Input
              className="mt-2 h-11 rounded-xl"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Flexbox layouts, media queries, DOM manipulation"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingRecording ? "Update Recording" : "Save Recording"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setEditingRecording(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Recordings List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-pt bg-surface/60 animate-pulse" />
          ))}
        </div>
      ) : filteredRecordings.length === 0 ? (
        <EmptyState
          title={
            activeTab === "all"
              ? "No recordings uploaded yet"
              : `No recordings for ${activeTab} yet`
          }
          description={`After each live class in ${activeTab === "all" ? courseTitle : activeTab}, paste your Drive link here.`}
          action={
            <Button size="lg" onClick={() => openNewForm(activeTab !== "all" ? activeTab : undefined)}>
              <Plus size={18} weight="bold" />
              Add Class 1 for {activeTab === "all" ? modules[0] : activeTab}
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredRecordings.map((recording) => {
            const recordingLevel = recording.level || modules[0] || "HTML & CSS";
            return (
              <div
                key={recording.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-pt bg-background p-4 sm:p-5 shadow-sm transition-all hover:border-primary/30"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <PlayCircle size={24} weight="duotone" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        Class {recording.classNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        {recordingLevel}
                      </span>
                    </div>
                    <p className="font-semibold text-pt text-base mt-1 truncate">
                      {recording.title}
                    </p>
                    {recording.notes && (
                      <p className="text-xs text-pt-muted mt-0.5 line-clamp-1">
                        {recording.notes}
                      </p>
                    )}
                    <a
                      href={recording.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1.5 font-medium"
                    >
                      <LinkSimple size={13} />
                      Open Drive Video
                    </a>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => openEditForm(recording)}
                  >
                    <PencilSimple size={14} />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-red-600 hover:text-red-700 gap-1 text-xs"
                    onClick={() =>
                      handleDelete(recording.id, recording.title, recording.level)
                    }
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
