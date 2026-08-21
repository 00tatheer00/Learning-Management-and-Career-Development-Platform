"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FilmStrip,
  Plus,
  Trash,
  Pencil,
  ArrowClockwise,
  CloudArrowUp,
  X,
  Clock,
  Info,
  VideoCamera,
  ShieldCheck,
  Play,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import * as tus from "tus-js-client";
import { VideoPlayer } from "@/components/portal/video-player";

interface Lecture {
  id: string;
  title: string;
  description: string;
  bunnyVideoId: string | null;
  duration: number | null;
  order: number;
  programSlug: string;
  level: string | null;
  createdAt: string;
}

interface TrainerRecordingsPanelProps {
  programSlug: string;
  courseTitle: string;
  modules: string[];
  initialModule?: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "Duration pending";
  const totalSecs = Math.round(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} mins`;
  return `${mins}m ${secs}s`;
}

export function TrainerRecordingsPanel({
  programSlug,
  courseTitle,
  modules,
  initialModule = "all",
}: TrainerRecordingsPanelProps) {
  const [recordings, setRecordings] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>(initialModule);
  const [showGuide, setShowGuide] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecording, setEditingRecording] = useState<Lecture | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLevel, setFormLevel] = useState(modules[0] || "HTML & CSS");
  const [formOrder, setFormOrder] = useState("1");
  const [formDuration, setFormDuration] = useState("");
  const [detectedSeconds, setDetectedSeconds] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload progress states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Preview video player
  const [previewRecording, setPreviewRecording] = useState<Lecture | null>(null);
  const [previewPlaybackUrl, setPreviewPlaybackUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Fetch all recordings for this trainer's program (with optional force sync)
  const loadRecordings = useCallback(
    async (forceSync = false) => {
      setLoading(true);
      try {
        const url = forceSync ? "/api/admin/lectures?sync=true" : "/api/admin/lectures";
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          const programLectures = (json.data || []).filter(
            (l: Lecture) => l.programSlug === programSlug
          );
          setRecordings(programLectures);
          if (forceSync) {
            toast.success("Synchronized recording durations with Bunny Stream!");
          }
        } else {
          toast.error(json.error ?? "Failed to load class recordings");
        }
      } catch {
        toast.error("Failed to load class recordings");
      } finally {
        setLoading(false);
      }
    },
    [programSlug]
  );

  useEffect(() => {
    void loadRecordings();
  }, [loadRecordings]);

  // Filter recordings by selected module tab
  const filteredRecordings = useMemo(() => {
    if (selectedModule === "all") return recordings;
    return recordings.filter(
      (r) => (r.level ?? "").toLowerCase() === selectedModule.toLowerCase()
    );
  }, [recordings, selectedModule]);

  // Compute per-module count
  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recordings.length };
    modules.forEach((mod) => {
      counts[mod] = recordings.filter(
        (r) => (r.level ?? "").toLowerCase() === mod.toLowerCase()
      ).length;
    });
    return counts;
  }, [recordings, modules]);

  // Compute suggested next class number when module changes
  const getNextClassNumber = useCallback(
    (targetModule: string) => {
      const modRecordings = recordings.filter(
        (r) => (r.level ?? "").toLowerCase() === targetModule.toLowerCase()
      );
      if (modRecordings.length === 0) return 1;
      return Math.max(...modRecordings.map((r) => r.order)) + 1;
    },
    [recordings]
  );

  // Open modal for creating a new recording
  const openCreateModal = () => {
    setEditingRecording(null);
    const defaultMod = selectedModule === "all" ? modules[0] || "HTML & CSS" : selectedModule;
    setFormLevel(defaultMod);
    setFormOrder(getNextClassNumber(defaultMod).toString());
    setFormTitle(`Class ${getNextClassNumber(defaultMod)}: `);
    setFormDescription("");
    setFormDuration("");
    setDetectedSeconds(null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // Open modal for editing a recording
  const openEditModal = (rec: Lecture) => {
    setEditingRecording(rec);
    setFormTitle(rec.title);
    setFormDescription(rec.description || "");
    setFormLevel(rec.level || modules[0] || "HTML & CSS");
    setFormOrder(rec.order.toString());
    setFormDuration(rec.duration ? (rec.duration / 60).toFixed(1) : "");
    setDetectedSeconds(rec.duration || null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // Handle module change inside form
  const handleFormModuleChange = (newModule: string) => {
    setFormLevel(newModule);
    if (!editingRecording) {
      const nextNum = getNextClassNumber(newModule);
      setFormOrder(nextNum.toString());
      setFormTitle(`Class ${nextNum}: `);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      try {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          if (video.duration && !isNaN(video.duration) && video.duration > 0) {
            const rawSecs = Math.round(video.duration);
            setDetectedSeconds(rawSecs);
            const mins = (video.duration / 60).toFixed(1);
            setFormDuration(mins);
          }
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
      } catch (err) {
        console.error("Auto duration detection error:", err);
      }
    }
  };

  // Handle preview playback
  const handlePreview = async (rec: Lecture) => {
    setPreviewRecording(rec);
    setLoadingPreview(true);
    setPreviewPlaybackUrl(null);
    try {
      const res = await fetch(`/api/student/lecture/${rec.id}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setPreviewPlaybackUrl(json.data.playbackUrl);
        // If duration was updated on server, update local state
        if (json.data.lecture?.duration && json.data.lecture.duration !== rec.duration) {
          setRecordings((prev) =>
            prev.map((item) =>
              item.id === rec.id ? { ...item, duration: json.data.lecture.duration } : item
            )
          );
        }
      } else {
        toast.error(json.error ?? "Failed to load video player preview");
        setPreviewRecording(null);
      }
    } catch {
      toast.error("Failed to load video player preview");
      setPreviewRecording(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Handle delete recording
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class recording? It will be removed from Bunny Stream and the student portal.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/lectures/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Class recording deleted successfully.");
        setRecordings((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(json.error ?? "Failed to delete recording");
      }
    } catch {
      toast.error("Failed to delete recording");
    }
  };

  // Handle form submission and Bunny Stream TUS upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRecording && !selectedFile) {
      toast.error("Please select a video file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (selectedFile) {
        // 1. Prepare upload session with Bunny Stream
        const prepRes = await fetch("/api/admin/lectures/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: formTitle }),
        });
        const prepJson = await prepRes.json();
        if (!prepJson.success) {
          throw new Error(prepJson.error ?? "Failed to prepare video upload");
        }

        const { libraryId, videoId, signature, expirationTime } = prepJson.data;

        // 2. Direct Resumable TUS Chunked Upload to Bunny Stream
        const upload = new tus.Upload(selectedFile, {
          endpoint: "https://video.bunnycdn.com/tusupload",
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: signature,
            AuthorizationExpire: expirationTime.toString(),
            VideoId: videoId,
            LibraryId: libraryId.toString(),
          },
          metadata: {
            filetype: selectedFile.type,
            title: formTitle,
          },
          onError: (error: Error) => {
            setUploading(false);
            toast.error(`Upload error: ${error.message}`);
          },
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const percent = Math.round((bytesUploaded / bytesTotal) * 100);
            setUploadProgress(percent);
          },
          onSuccess: async () => {
            // 3. Finalize recording in database
            try {
              const res = await fetch("/api/admin/lectures/finalize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: formTitle,
                  description: formDescription,
                  programSlug,
                  level: formLevel,
                  order: formOrder,
                  duration: formDuration
                    ? (parseFloat(formDuration) * 60).toString()
                    : detectedSeconds
                    ? detectedSeconds.toString()
                    : null,
                  bunnyVideoId: videoId,
                  lectureId: editingRecording?.id || null,
                }),
              });
              const json = await res.json();
              setUploading(false);
              if (json.success) {
                toast.success(
                  editingRecording
                    ? "Class recording updated successfully!"
                    : "Class recording uploaded and published to students successfully!"
                );
                setIsModalOpen(false);
                void loadRecordings();
              } else {
                toast.error(json.error ?? "Failed to finalize recording");
              }
            } catch {
              setUploading(false);
              toast.error("Failed to finalize recording");
            }
          },
        });
        upload.start();
      } else {
        // Metadata only update
        const res = await fetch("/api/admin/lectures/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
            programSlug,
            level: formLevel,
            order: formOrder,
            duration: formDuration
              ? (parseFloat(formDuration) * 60).toString()
              : detectedSeconds
              ? detectedSeconds.toString()
              : null,
            bunnyVideoId: editingRecording?.bunnyVideoId || "",
            lectureId: editingRecording?.id || null,
          }),
        });
        const json = await res.json();
        setUploading(false);
        if (json.success) {
          toast.success("Class recording details updated successfully!");
          setIsModalOpen(false);
          void loadRecordings();
        } else {
          toast.error(json.error ?? "Failed to update recording");
        }
      }
    } catch (error) {
      setUploading(false);
      const errMessage = error instanceof Error ? error.message : "Failed to process video upload";
      toast.error(errMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PortalPageHeader
        eyebrow={courseTitle}
        title="Class Recordings"
        description="Upload and publish high-definition Bunny Stream class video recordings for your students. Students can watch them with DRM encryption, auto-resuming, and study notes."
      >
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => void loadRecordings(true)}
            disabled={loading || uploading}
            title="Sync real video duration and status directly from Bunny Stream"
          >
            <ArrowClockwise size={18} className={cn(loading && "animate-spin")} />
            Sync with Bunny
          </Button>
          <Button onClick={openCreateModal} disabled={uploading}>
            <Plus size={18} />
            Upload Class Recording
          </Button>
        </div>
      </PortalPageHeader>

      {/* Trainer Instructions Guide Card */}
      {showGuide && (
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-surface p-5 sm:p-6 shadow-sm">
          <button
            onClick={() => setShowGuide(false)}
            className="absolute top-4 right-4 text-pt-muted hover:text-pt p-1 rounded-lg"
            title="Dismiss guide"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <Info size={20} weight="fill" className="text-primary" />
            <h3 className="font-bold text-base text-pt">Trainer Recording Guidelines &amp; Quick Instructions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <VideoCamera size={16} weight="duotone" />
                1. Screen Record
              </div>
              <p className="text-xs text-pt-muted leading-relaxed">
                Live class ke dauran OBS, Zoom, ya Google Meet se screen record karein (720p/1080p MP4 recommended).
              </p>
            </div>

            <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <FilmStrip size={16} weight="duotone" />
                2. Select Module &amp; Class
              </div>
              <p className="text-xs text-pt-muted leading-relaxed">
                Recording upload karte waqt target module aur Class number (e.g. Class 1, 2) select karein.
              </p>
            </div>

            <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <CloudArrowUp size={16} weight="duotone" />
                3. Direct Bunny Upload
              </div>
              <p className="text-xs text-pt-muted leading-relaxed">
                Video file drag &amp; drop karein. High-speed resumable chunked upload se bari files bhi foran upload hoti hain.
              </p>
            </div>

            <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck size={16} weight="duotone" />
                4. Instant Protected Access
              </div>
              <p className="text-xs text-pt-muted leading-relaxed">
                Video Bunny Stream par auto-transcode hokar students ke portal par DRM protection aur notes ke sath live ho jayegi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Module Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
        <button
          onClick={() => setSelectedModule("all")}
          className={cn(
            "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors shrink-0 whitespace-nowrap",
            selectedModule === "all"
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          All Modules
          <span className="ml-2 text-xs opacity-75">({moduleCounts.all ?? 0})</span>
        </button>

        {modules.map((mod) => (
          <button
            key={mod}
            onClick={() => setSelectedModule(mod)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors shrink-0 whitespace-nowrap",
              selectedModule === mod
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {mod}
            <span className="ml-2 text-xs opacity-75">({moduleCounts[mod] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Recordings List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
          <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
          <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
        </div>
      ) : filteredRecordings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-xl mx-auto">
          <FilmStrip size={48} className="mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-bold text-lg">No class recordings found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {selectedModule === "all"
              ? "You haven't uploaded any class recordings for this program yet. Click \"Upload Class Recording\" to publish your first video."
              : `No recordings uploaded for "${selectedModule}" yet. Switch tabs or upload a new recording.`}
          </p>
          <Button onClick={openCreateModal} className="mt-6">
            <Plus size={16} className="mr-1" />
            Upload Class Recording
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecordings.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-pt bg-gradient-to-br from-background to-surface/60 gap-5 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex gap-4 items-center flex-1 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-extrabold text-sm border border-primary/20 group-hover:scale-105 transition-all duration-300">
                  #{rec.order}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center flex-wrap gap-2">
                    <h4 className="font-extrabold text-lg text-pt leading-snug group-hover:text-primary transition-colors">
                      {rec.title}
                    </h4>
                    {rec.level && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                        {rec.level}
                      </span>
                    )}
                  </div>
                  {rec.description && (
                    <p className="text-sm text-pt-muted line-clamp-1 max-w-xl">{rec.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-pt-muted font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(rec.duration)}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] bg-surface/80 px-2 py-0.5 rounded text-pt-muted border border-pt">
                      GUID: {rec.bunnyVideoId || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border border-pt bg-background hover:bg-surface text-pt font-bold transition-all px-3"
                  onClick={() => handlePreview(rec)}
                  disabled={uploading}
                >
                  <Play size={15} weight="fill" className="mr-1.5 text-primary" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border border-pt bg-background hover:bg-surface text-pt-muted font-bold transition-all px-3"
                  onClick={() => openEditModal(rec)}
                  disabled={uploading}
                >
                  <Pencil size={15} className="mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border border-red-200/50 bg-background hover:bg-red-500/10 text-red-500 font-bold transition-all px-3"
                  onClick={() => handleDelete(rec.id)}
                  disabled={uploading}
                >
                  <Trash size={15} className="mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Preview Modal */}
      {previewRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-zinc-950 p-5 sm:p-7 shadow-2xl border border-zinc-800">
            <button
              onClick={() => {
                setPreviewRecording(null);
                setPreviewPlaybackUrl(null);
              }}
              className="absolute right-5 top-5 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <X size={20} weight="bold" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              Preview Recording: {previewRecording.title}
            </h3>

            <div className="mt-2">
              {loadingPreview ? (
                <div className="aspect-video bg-zinc-950 rounded-2xl border border-zinc-800/80 flex flex-col items-center justify-center p-6 space-y-3">
                  <span className="text-xs font-medium text-zinc-400">Loading Bunny Stream preview...</span>
                </div>
              ) : (
                previewPlaybackUrl && (
                  <VideoPlayer
                    lectureId={previewRecording.id}
                    playbackUrl={previewPlaybackUrl}
                    initialTime={0}
                    hasNextLecture={false}
                    hasPrevLecture={false}
                    onPlayNext={() => {}}
                    onPlayPrev={() => {}}
                    onClose={() => {
                      setPreviewRecording(null);
                      setPreviewPlaybackUrl(null);
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => !uploading && setIsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              disabled={uploading}
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold">
              {editingRecording ? "Edit Class Recording" : "Upload Class Recording to Bunny Stream"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {editingRecording
                ? "Modify class recording title, module, or replace its video file."
                : "Select the target module and video file. High-speed resumable upload will stream it to Bunny."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Target Module
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => handleFormModuleChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    disabled={uploading}
                  >
                    {modules.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Class Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    disabled={uploading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Class Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Class 1: Introduction to Semantic HTML"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Class Description / Key Topics
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What was covered in this live session?"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Approx Duration (Minutes) (Optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="e.g. 45 (optional, Bunny detects automatically)"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Recorded Video File {editingRecording ? "(Optional: select only to replace)" : ""}
                </label>
                <div className="relative border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <CloudArrowUp size={28} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    {selectedFile ? selectedFile.name : "Drag & drop or click to browse screen recording video"}
                  </p>
                  {selectedFile && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-1.5 text-[11px]">
                      <span className="text-primary font-bold">
                        Size: {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      {detectedSeconds && detectedSeconds > 0 && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-emerald-500 font-bold">
                            Length: {formatDuration(detectedSeconds)}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-2 py-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-primary animate-pulse">Uploading HD video to Bunny Stream...</span>
                    <span className="font-mono font-bold text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-pt-muted">
                    Do not close this window while the upload is in progress.
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? `Uploading (${uploadProgress}%)` : editingRecording ? "Save Changes" : "Upload to Bunny Stream"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
