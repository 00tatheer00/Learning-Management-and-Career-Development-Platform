"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FilmStrip,
  Plus,
  Trash,
  Pencil,
  ArrowClockwise,
  X,
  PlayCircle,
  Copy,
  Check,
  ArrowSquareOut,
  MagnifyingGlass,
  Info,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import type { ClassRecordingRecord } from "@/lib/api/class-recordings";

interface TrainerRecordingsPanelProps {
  programSlug: string;
  courseTitle: string;
  modules: string[];
  initialModule?: string;
}

export function TrainerRecordingsPanel({
  programSlug,
  courseTitle,
  modules,
  initialModule = "all",
}: TrainerRecordingsPanelProps) {
  // Data states
  const [driveRecordings, setDriveRecordings] = useState<ClassRecordingRecord[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(true);

  // Filter and Search states
  const [selectedModule, setSelectedModule] = useState<string>(initialModule);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal Form States
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [editingDriveRec, setEditingDriveRec] = useState<ClassRecordingRecord | null>(null);
  const [driveFormClassNumber, setDriveFormClassNumber] = useState("1");
  const [driveFormTitle, setDriveFormTitle] = useState("");
  const [driveFormUrl, setDriveFormUrl] = useState("");
  const [driveFormLevel, setDriveFormLevel] = useState(modules[0] || "HTML & CSS");
  const [driveFormNotes, setDriveFormNotes] = useState("");
  const [savingDrive, setSavingDrive] = useState(false);

  // -------------------------------------------------------------
  // Load Google Drive Recordings
  // -------------------------------------------------------------
  const loadDriveRecordings = useCallback(async () => {
    setLoadingDrive(true);
    try {
      const res = await fetch(
        `/api/trainer/recordings?module=all&programSlug=${encodeURIComponent(programSlug)}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (json.success) {
        setDriveRecordings(json.data || []);
      } else {
        toast.error(json.error ?? "Failed to load class recordings");
      }
    } catch {
      toast.error("Failed to load class recordings");
    } finally {
      setLoadingDrive(false);
    }
  }, [programSlug]);

  useEffect(() => {
    void loadDriveRecordings();
  }, [loadDriveRecordings]);

  // -------------------------------------------------------------
  // Auto next class calculations
  // -------------------------------------------------------------
  const getNextDriveClassNumber = useCallback(
    (targetModule: string) => {
      const modRecs = driveRecordings.filter(
        (r) => (r.level ?? "").toLowerCase() === targetModule.toLowerCase()
      );
      if (modRecs.length === 0) return 1;
      const maxNum = Math.max(...modRecs.map((r) => r.classNumber || 0));
      return maxNum + 1;
    },
    [driveRecordings]
  );

  // -------------------------------------------------------------
  // Modal Open Handlers
  // -------------------------------------------------------------
  const openCreateDriveModal = () => {
    setEditingDriveRec(null);
    const defaultMod = selectedModule === "all" ? modules[0] || "HTML & CSS" : selectedModule;
    const nextNum = getNextDriveClassNumber(defaultMod);
    setDriveFormLevel(defaultMod);
    setDriveFormClassNumber(nextNum.toString());
    setDriveFormTitle(`Class ${nextNum}: `);
    setDriveFormUrl("");
    setDriveFormNotes("");
    setIsDriveModalOpen(true);
  };

  const openEditDriveModal = (rec: ClassRecordingRecord) => {
    setEditingDriveRec(rec);
    setDriveFormClassNumber(rec.classNumber.toString());
    setDriveFormTitle(rec.title);
    setDriveFormUrl(rec.driveUrl);
    setDriveFormLevel(rec.level || modules[0] || "HTML & CSS");
    setDriveFormNotes(rec.notes || "");
    setIsDriveModalOpen(true);
  };

  const handleDriveModuleChange = (newModule: string) => {
    setDriveFormLevel(newModule);
    if (!editingDriveRec) {
      const nextNum = getNextDriveClassNumber(newModule);
      setDriveFormClassNumber(nextNum.toString());
      setDriveFormTitle(`Class ${nextNum}: `);
    }
  };

  const handleSaveDriveRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveFormUrl.trim()) {
      toast.error("Please enter a valid Google Drive or video URL");
      return;
    }
    setSavingDrive(true);
    try {
      const res = await fetch("/api/trainer/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programSlug,
          classNumber: parseInt(driveFormClassNumber, 10) || 1,
          title: driveFormTitle.trim(),
          driveUrl: driveFormUrl.trim(),
          level: driveFormLevel,
          notes: driveFormNotes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          editingDriveRec
            ? "Class recording updated successfully!"
            : "Class recording added and published successfully!"
        );
        setIsDriveModalOpen(false);
        void loadDriveRecordings();
      } else {
        toast.error(json.message ?? json.error ?? "Failed to save class recording");
      }
    } catch {
      toast.error("Network error while saving class recording");
    } finally {
      setSavingDrive(false);
    }
  };

  const handleDeleteDriveRecording = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class recording?")) {
      return;
    }
    try {
      const res = await fetch(`/api/trainer/recordings?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Class recording deleted successfully.");
        setDriveRecordings((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(json.error ?? "Failed to delete class recording");
      }
    } catch {
      toast.error("Failed to delete class recording");
    }
  };

  const handleCopyLink = (e: React.MouseEvent, url: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedId(id);
        toast.success("Recording link copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2500);
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  // -------------------------------------------------------------
  // Filtered List
  // -------------------------------------------------------------
  const filteredDriveRecordings = useMemo(() => {
    return driveRecordings.filter((r) => {
      const matchModule =
        selectedModule === "all" ||
        (r.level && r.level.toLowerCase() === selectedModule.toLowerCase());
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        r.title.toLowerCase().includes(query) ||
        (r.notes && r.notes.toLowerCase().includes(query)) ||
        r.classNumber.toString().includes(query);
      return matchModule && matchQuery;
    });
  }, [driveRecordings, selectedModule, searchQuery]);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Trainer Archive"
        title="Class Recordings"
        description={`Manage published Google Drive recordings, class notes, and video archives for ${courseTitle}.`}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadDriveRecordings()}
            disabled={loadingDrive}
            className="gap-1.5 rounded-xl border-pt bg-surface text-xs font-semibold"
          >
            <ArrowClockwise size={15} className={cn(loadingDrive && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={openCreateDriveModal}
            className="gap-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20"
          >
            <Plus size={16} weight="bold" />
            Add Class Recording
          </Button>
        </div>
      </PortalPageHeader>

      {/* Info Banner */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-xs dark:border-sky-900/50 dark:bg-sky-950/20 text-sky-950 dark:text-sky-200">
        <div className="flex items-start gap-3">
          <Info size={20} className="shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Google Drive Class Recordings</p>
            <p className="leading-relaxed opacity-90">
              Upload your daily recorded class to Google Drive, ensure the share permissions allow your students to view, and paste the share link here. Students will see recordings organized by module.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Module Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Module Pill Filter */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-pt bg-surface/80 p-1 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setSelectedModule("all")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
              selectedModule === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-surface"
            )}
          >
            All Modules ({driveRecordings.length})
          </button>
          {modules.map((mod) => {
            const count = driveRecordings.filter(
              (r) => (r.level ?? "").toLowerCase() === mod.toLowerCase()
            ).length;
            return (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModule(mod)}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                  selectedModule === mod
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                )}
              >
                {mod} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <MagnifyingGlass
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search class recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-pt bg-surface pl-9 pr-3 py-1.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Recordings Grid / List */}
      {loadingDrive ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowClockwise size={32} className="animate-spin text-primary mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">Loading recordings...</p>
        </div>
      ) : filteredDriveRecordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-pt bg-surface/40 py-16 px-6 text-center">
          <FilmStrip size={44} className="text-muted-foreground mb-3 opacity-50" />
          <h3 className="text-base font-bold text-foreground">No class recordings found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? "No recordings match your search query."
              : "You have not published any class recordings for this module yet."}
          </p>
          <Button size="sm" onClick={openCreateDriveModal} className="mt-4 gap-1.5 text-xs">
            <Plus size={16} /> Add First Recording
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDriveRecordings.map((rec) => (
            <div
              key={rec.id}
              className="group flex flex-col justify-between rounded-3xl border border-pt bg-surface/90 p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary">
                      {rec.classNumber}
                    </span>
                    <span className="rounded-full bg-surface border border-pt px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {rec.level || "General"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditDriveModal(rec)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                      title="Edit recording"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDriveRecording(rec.id)}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                      title="Delete recording"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                    {rec.title}
                  </h4>
                  {rec.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {rec.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-pt flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCopyLink(e, rec.driveUrl, rec.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedId === rec.id ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={rec.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <PlayCircle size={15} weight="fill" />
                  <span>Open Video</span>
                  <ArrowSquareOut size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADD / EDIT GOOGLE DRIVE RECORDING
         ------------------------------------------------------------- */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-pt bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <PlayCircle size={22} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingDriveRec ? "Edit Class Recording" : "Add Class Recording"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Publish class video link for students
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !savingDrive && setIsDriveModalOpen(false)}
                disabled={savingDrive}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDriveRecording} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Course Module *
                  </label>
                  <select
                    value={driveFormLevel}
                    onChange={(e) => handleDriveModuleChange(e.target.value)}
                    disabled={savingDrive}
                    className="w-full rounded-xl border border-pt bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {modules.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Class Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={driveFormClassNumber}
                    onChange={(e) => setDriveFormClassNumber(e.target.value)}
                    disabled={savingDrive}
                    required
                    className="w-full rounded-xl border border-pt bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Class Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 1: Introduction to Web Development"
                  value={driveFormTitle}
                  onChange={(e) => setDriveFormTitle(e.target.value)}
                  disabled={savingDrive}
                  required
                  className="w-full rounded-xl border border-pt bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Google Drive / Video Link *
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={driveFormUrl}
                  onChange={(e) => setDriveFormUrl(e.target.value)}
                  disabled={savingDrive}
                  required
                  className="w-full rounded-xl border border-pt bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Make sure link access in Google Drive is set to &ldquo;Anyone with the link can view&rdquo; or shared with student emails.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Study Notes / Summary (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Topics covered, homework instructions, resource links..."
                  value={driveFormNotes}
                  onChange={(e) => setDriveFormNotes(e.target.value)}
                  disabled={savingDrive}
                  className="w-full rounded-xl border border-pt bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pt">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDriveModalOpen(false)}
                  disabled={savingDrive}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={savingDrive}>
                  {savingDrive
                    ? "Saving..."
                    : editingDriveRec
                    ? "Update Recording"
                    : "Publish Recording"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
