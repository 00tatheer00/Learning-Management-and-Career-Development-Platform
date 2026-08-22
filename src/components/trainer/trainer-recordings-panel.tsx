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
  PlayCircle,
  Copy,
  Check,
  ArrowSquareOut,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import * as tus from "tus-js-client";
import { VideoPlayer } from "@/components/portal/video-player";
import type { ClassRecordingRecord } from "@/lib/api/class-recordings";

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
  // Active Management Tab: "drive" (Google Drive) | "bunny" (Bunny Stream HD)
  const [activeTab, setActiveTab] = useState<"drive" | "bunny">("drive");

  // Data states
  const [driveRecordings, setDriveRecordings] = useState<ClassRecordingRecord[]>([]);
  const [bunnyRecordings, setBunnyRecordings] = useState<Lecture[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(true);
  const [loadingBunny, setLoadingBunny] = useState(true);

  // Filter and Search states
  const [selectedModule, setSelectedModule] = useState<string>(initialModule);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuide, setShowGuide] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Google Drive Modal Form States
  // -------------------------------------------------------------
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [editingDriveRec, setEditingDriveRec] = useState<ClassRecordingRecord | null>(null);
  const [driveFormClassNumber, setDriveFormClassNumber] = useState("1");
  const [driveFormTitle, setDriveFormTitle] = useState("");
  const [driveFormUrl, setDriveFormUrl] = useState("");
  const [driveFormLevel, setDriveFormLevel] = useState(modules[0] || "HTML & CSS");
  const [driveFormNotes, setDriveFormNotes] = useState("");
  const [savingDrive, setSavingDrive] = useState(false);

  // -------------------------------------------------------------
  // Bunny Stream Modal Form States
  // -------------------------------------------------------------
  const [isBunnyModalOpen, setIsBunnyModalOpen] = useState(false);
  const [editingBunnyRec, setEditingBunnyRec] = useState<Lecture | null>(null);
  const [bunnyFormTitle, setBunnyFormTitle] = useState("");
  const [bunnyFormDescription, setBunnyFormDescription] = useState("");
  const [bunnyFormLevel, setBunnyFormLevel] = useState(modules[0] || "HTML & CSS");
  const [bunnyFormOrder, setBunnyFormOrder] = useState("1");
  const [bunnyFormDuration, setBunnyFormDuration] = useState("");
  const [detectedSeconds, setDetectedSeconds] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingBunny, setUploadingBunny] = useState(false);
  const [bunnyUploadProgress, setBunnyUploadProgress] = useState(0);

  // Preview video player
  const [previewRecording, setPreviewRecording] = useState<Lecture | null>(null);
  const [previewPlaybackUrl, setPreviewPlaybackUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // -------------------------------------------------------------
  // Load Google Drive Recordings
  // -------------------------------------------------------------
  const loadDriveRecordings = useCallback(async () => {
    setLoadingDrive(true);
    try {
      const res = await fetch("/api/trainer/recordings?module=all", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setDriveRecordings(json.data || []);
      } else {
        toast.error(json.error ?? "Failed to load Google Drive recordings");
      }
    } catch {
      toast.error("Failed to load Google Drive recordings");
    } finally {
      setLoadingDrive(false);
    }
  }, []);

  // -------------------------------------------------------------
  // Load Bunny Stream Lectures
  // -------------------------------------------------------------
  const loadBunnyRecordings = useCallback(
    async (forceSync = false) => {
      setLoadingBunny(true);
      try {
        const url = forceSync ? "/api/admin/lectures?sync=true" : "/api/admin/lectures";
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          const programLectures = (json.data || []).filter(
            (l: Lecture) => l.programSlug === programSlug
          );
          setBunnyRecordings(programLectures);
          if (forceSync) {
            toast.success("Synchronized recording durations with Bunny Stream!");
          }
        } else {
          toast.error(json.error ?? "Failed to load Bunny Stream recordings");
        }
      } catch {
        toast.error("Failed to load Bunny Stream recordings");
      } finally {
        setLoadingBunny(false);
      }
    },
    [programSlug]
  );

  useEffect(() => {
    void loadDriveRecordings();
    void loadBunnyRecordings();
  }, [loadDriveRecordings, loadBunnyRecordings]);

  // -------------------------------------------------------------
  // Auto next class calculations
  // -------------------------------------------------------------
  const getNextDriveClassNumber = useCallback(
    (targetModule: string) => {
      const modRecs = driveRecordings.filter(
        (r) => (r.level ?? "").toLowerCase() === targetModule.toLowerCase()
      );
      if (modRecs.length === 0) return 1;
      return Math.max(...modRecs.map((r) => r.classNumber)) + 1;
    },
    [driveRecordings]
  );

  const getNextBunnyClassNumber = useCallback(
    (targetModule: string) => {
      const modRecs = bunnyRecordings.filter(
        (r) => (r.level ?? "").toLowerCase() === targetModule.toLowerCase()
      );
      if (modRecs.length === 0) return 1;
      return Math.max(...modRecs.map((r) => r.order)) + 1;
    },
    [bunnyRecordings]
  );

  // -------------------------------------------------------------
  // Filtered Lists
  // -------------------------------------------------------------
  const filteredDriveRecordings = useMemo(() => {
    return driveRecordings.filter((r) => {
      const matchModule =
        selectedModule === "all" ||
        (r.level ?? "").toLowerCase() === selectedModule.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.classNumber.toString() === searchQuery.trim() ||
        (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchModule && matchQuery;
    });
  }, [driveRecordings, selectedModule, searchQuery]);

  const filteredBunnyRecordings = useMemo(() => {
    return bunnyRecordings.filter((r) => {
      const matchModule =
        selectedModule === "all" ||
        (r.level ?? "").toLowerCase() === selectedModule.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.order.toString() === searchQuery.trim() ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchModule && matchQuery;
    });
  }, [bunnyRecordings, selectedModule, searchQuery]);

  // -------------------------------------------------------------
  // Drive Modals & CRUD Handlers
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
    setDriveFormLevel(rec.level || modules[0] || "HTML & CSS");
    setDriveFormClassNumber(rec.classNumber.toString());
    setDriveFormTitle(rec.title);
    setDriveFormUrl(rec.driveUrl);
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
            ? "Google Drive recording updated successfully!"
            : "Google Drive recording added and published successfully!"
        );
        setIsDriveModalOpen(false);
        void loadDriveRecordings();
      } else {
        toast.error(json.message ?? json.error ?? "Failed to save Google Drive recording");
      }
    } catch {
      toast.error("Network error while saving Google Drive recording");
    } finally {
      setSavingDrive(false);
    }
  };

  const handleDeleteDriveRecording = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Google Drive recording?")) {
      return;
    }
    try {
      const res = await fetch(`/api/trainer/recordings?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Google Drive recording deleted successfully.");
        setDriveRecordings((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(json.error ?? "Failed to delete Google Drive recording");
      }
    } catch {
      toast.error("Failed to delete Google Drive recording");
    }
  };

  const handleCopyLink = (e: React.MouseEvent, url: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // -------------------------------------------------------------
  // Bunny Modals & CRUD Handlers
  // -------------------------------------------------------------
  const openCreateBunnyModal = () => {
    setEditingBunnyRec(null);
    const defaultMod = selectedModule === "all" ? modules[0] || "HTML & CSS" : selectedModule;
    const nextNum = getNextBunnyClassNumber(defaultMod);
    setBunnyFormLevel(defaultMod);
    setBunnyFormOrder(nextNum.toString());
    setBunnyFormTitle(`Class ${nextNum}: `);
    setBunnyFormDescription("");
    setBunnyFormDuration("");
    setDetectedSeconds(null);
    setSelectedFile(null);
    setIsBunnyModalOpen(true);
  };

  const openEditBunnyModal = (rec: Lecture) => {
    setEditingBunnyRec(rec);
    setBunnyFormTitle(rec.title);
    setBunnyFormDescription(rec.description || "");
    setBunnyFormLevel(rec.level || modules[0] || "HTML & CSS");
    setBunnyFormOrder(rec.order.toString());
    setBunnyFormDuration(rec.duration ? (rec.duration / 60).toFixed(1) : "");
    setDetectedSeconds(rec.duration || null);
    setSelectedFile(null);
    setIsBunnyModalOpen(true);
  };

  const handleBunnyModuleChange = (newModule: string) => {
    setBunnyFormLevel(newModule);
    if (!editingBunnyRec) {
      const nextNum = getNextBunnyClassNumber(newModule);
      setBunnyFormOrder(nextNum.toString());
      setBunnyFormTitle(`Class ${nextNum}: `);
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
            setBunnyFormDuration(mins);
          }
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
      } catch (err) {
        console.error("Auto duration detection error:", err);
      }
    }
  };

  const handlePreviewBunny = async (rec: Lecture) => {
    setPreviewRecording(rec);
    setLoadingPreview(true);
    setPreviewPlaybackUrl(null);
    try {
      const res = await fetch(`/api/student/lecture/${rec.id}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setPreviewPlaybackUrl(json.data.playbackUrl);
        if (json.data.lecture?.duration && json.data.lecture.duration !== rec.duration) {
          setBunnyRecordings((prev) =>
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

  const handleDeleteBunny = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this Bunny Stream recording? It will be removed from Bunny CDN and the student portal."
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/lectures/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Bunny Stream class recording deleted successfully.");
        setBunnyRecordings((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(json.error ?? "Failed to delete recording");
      }
    } catch {
      toast.error("Failed to delete recording");
    }
  };

  const handleSaveBunnyRecording = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBunnyRec && !selectedFile) {
      toast.error("Please select a video file to upload");
      return;
    }

    setUploadingBunny(true);
    setBunnyUploadProgress(0);

    try {
      if (selectedFile) {
        // 1. Prepare upload session with Bunny Stream
        const prepRes = await fetch("/api/admin/lectures/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: bunnyFormTitle }),
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
            title: bunnyFormTitle,
          },
          onError: (error: Error) => {
            setUploadingBunny(false);
            toast.error(`Upload error: ${error.message}`);
          },
          onProgress: (bytesUploaded: number, bytesTotal: number) => {
            const percent = Math.round((bytesUploaded / bytesTotal) * 100);
            setBunnyUploadProgress(percent);
          },
          onSuccess: async () => {
            // 3. Finalize recording in database
            try {
              const res = await fetch("/api/admin/lectures/finalize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: bunnyFormTitle,
                  description: bunnyFormDescription,
                  programSlug,
                  level: bunnyFormLevel,
                  order: bunnyFormOrder,
                  duration: bunnyFormDuration
                    ? (parseFloat(bunnyFormDuration) * 60).toString()
                    : detectedSeconds
                    ? detectedSeconds.toString()
                    : null,
                  bunnyVideoId: videoId,
                  lectureId: editingBunnyRec?.id || null,
                }),
              });
              const json = await res.json();
              setUploadingBunny(false);
              if (json.success) {
                toast.success(
                  editingBunnyRec
                    ? "Class recording updated successfully!"
                    : "Class recording uploaded and published to students successfully!"
                );
                setIsBunnyModalOpen(false);
                void loadBunnyRecordings();
              } else {
                toast.error(json.error ?? "Failed to finalize recording");
              }
            } catch {
              setUploadingBunny(false);
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
            title: bunnyFormTitle,
            description: bunnyFormDescription,
            programSlug,
            level: bunnyFormLevel,
            order: bunnyFormOrder,
            duration: bunnyFormDuration
              ? (parseFloat(bunnyFormDuration) * 60).toString()
              : detectedSeconds
              ? detectedSeconds.toString()
              : null,
            bunnyVideoId: editingBunnyRec?.bunnyVideoId || "",
            lectureId: editingBunnyRec?.id || null,
          }),
        });
        const json = await res.json();
        setUploadingBunny(false);
        if (json.success) {
          toast.success("Class recording details updated successfully!");
          setIsBunnyModalOpen(false);
          void loadBunnyRecordings();
        } else {
          toast.error(json.error ?? "Failed to update recording");
        }
      }
    } catch (error) {
      setUploadingBunny(false);
      const errMessage = error instanceof Error ? error.message : "Failed to process video upload";
      toast.error(errMessage);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <PortalPageHeader
        eyebrow={courseTitle}
        title="Class Recordings Manager"
        description="Provide students with both Google Drive backup links and high-definition Bunny Stream recordings. Both options are accessible on separate student pages."
      >
        <div className="flex flex-wrap gap-2">
          {activeTab === "drive" ? (
            <Button onClick={openCreateDriveModal} disabled={savingDrive}>
              <Plus size={18} className="mr-1.5" />
              Add Google Drive Link
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => void loadBunnyRecordings(true)}
                disabled={loadingBunny || uploadingBunny}
                title="Sync real video duration and status directly from Bunny Stream"
              >
                <ArrowClockwise size={18} className={cn(loadingBunny && "animate-spin")} />
                Sync Bunny
              </Button>
              <Button onClick={openCreateBunnyModal} disabled={uploadingBunny}>
                <Plus size={18} className="mr-1.5" />
                Upload Bunny Video
              </Button>
            </>
          )}
        </div>
      </PortalPageHeader>

      {/* 🚀 Dual-Mode Platform Switcher Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-2xl bg-surface border border-pt">
        <button
          type="button"
          onClick={() => setActiveTab("drive")}
          className={cn(
            "flex items-center justify-between p-3.5 rounded-xl text-left font-bold transition-all",
            activeTab === "drive"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-background/80"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                activeTab === "drive"
                  ? "bg-white/20 border-white/30 text-white"
                  : "bg-primary/10 border-primary/20 text-primary"
              )}
            >
              <PlayCircle size={22} weight="duotone" />
            </div>
            <div>
              <p className="text-sm">Option 1: Google Drive Links</p>
              <p
                className={cn(
                  "text-xs font-normal",
                  activeTab === "drive" ? "text-white/80" : "text-muted-foreground"
                )}
              >
                Fast link paste · Instant student access
              </p>
            </div>
          </div>
          <span
            className={cn(
              "text-xs font-extrabold px-2.5 py-1 rounded-full",
              activeTab === "drive"
                ? "bg-white/20 text-white"
                : "bg-surface border border-pt text-pt"
            )}
          >
            {driveRecordings.length} Videos
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bunny")}
          className={cn(
            "flex items-center justify-between p-3.5 rounded-xl text-left font-bold transition-all",
            activeTab === "bunny"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-background/80"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                activeTab === "bunny"
                  ? "bg-white/20 border-white/30 text-white"
                  : "bg-primary/10 border-primary/20 text-primary"
              )}
            >
              <FilmStrip size={22} weight="duotone" />
            </div>
            <div>
              <p className="text-sm">Option 2: Bunny Stream HD Video</p>
              <p
                className={cn(
                  "text-xs font-normal",
                  activeTab === "bunny" ? "text-white/80" : "text-muted-foreground"
                )}
              >
                Direct file upload · DRM Player &amp; Notes
              </p>
            </div>
          </div>
          <span
            className={cn(
              "text-xs font-extrabold px-2.5 py-1 rounded-full",
              activeTab === "bunny"
                ? "bg-white/20 text-white"
                : "bg-surface border border-pt text-pt"
            )}
          >
            {bunnyRecordings.length} Videos
          </span>
        </button>
      </div>

      {/* Guide Cards */}
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
            <h3 className="font-bold text-base text-pt">
              {activeTab === "drive"
                ? "Google Drive Link Upload Guidelines"
                : "Bunny Stream Direct Video Upload Guidelines"}
            </h3>
          </div>
          {activeTab === "drive" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <PlayCircle size={16} weight="duotone" />
                  1. Google Drive Link Copy
                </div>
                <p className="text-xs text-pt-muted leading-relaxed">
                  Google Drive par class video upload kar ke link copy karein (Access: Anyone with link can view).
                </p>
              </div>

              <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <FilmStrip size={16} weight="duotone" />
                  2. Select Module &amp; Class #
                </div>
                <p className="text-xs text-pt-muted leading-relaxed">
                  Module (e.g. HTML &amp; CSS, React) aur Class Number select kar ke title aur link paste karein.
                </p>
              </div>

              <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck size={16} weight="duotone" />
                  3. Instant Backup Access
                </div>
                <p className="text-xs text-pt-muted leading-relaxed">
                  Students ke &quot;Drive Recordings&quot; page par instant link live ho jayega, agar stream me issue aye to wo yahan se dekh sakein.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <VideoCamera size={16} weight="duotone" />
                  1. Screen Record MP4
                </div>
                <p className="text-xs text-pt-muted leading-relaxed">
                  Google Meet ya OBS recording MP4 file tayyar karein (720p/1080p recommended).
                </p>
              </div>

              <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <FilmStrip size={16} weight="duotone" />
                  2. Select Module
                </div>
                <p className="text-xs text-pt-muted leading-relaxed">
                  Target module aur Class number select karein. Title automatically set ho jayega.
                </p>
              </div>

              <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <CloudArrowUp size={16} weight="duotone" />
                  3. Resumable Upload
                </div>
                <p className="text-xs text-pt-muted leading-relaxed">
                  File upload karein. High-speed chunked upload se barhi video files bhi fast upload hoti hain.
                </p>
              </div>

              <div className="rounded-2xl border border-pt bg-surface/50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck size={16} weight="duotone" />
                  4. HD Stream Player
                </div>
                <p className="text-xs text-pt-muted leading-relaxed">
                  Student portal par DRM protection, auto-resuming, aur timestamped notes ke sath play hoga.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Module Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 border-b border-border/60">
            <button
              onClick={() => setSelectedModule("all")}
              className={cn(
                "rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 whitespace-nowrap",
                selectedModule === "all"
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              All Modules (
              {activeTab === "drive" ? driveRecordings.length : bunnyRecordings.length})
            </button>
            {modules.map((mod) => {
              const count =
                activeTab === "drive"
                  ? driveRecordings.filter(
                      (r) => (r.level ?? "").toLowerCase() === mod.toLowerCase()
                    ).length
                  : bunnyRecordings.filter(
                      (r) => (r.level ?? "").toLowerCase() === mod.toLowerCase()
                    ).length;
              return (
                <button
                  key={mod}
                  onClick={() => setSelectedModule(mod)}
                  className={cn(
                    "rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 whitespace-nowrap",
                    selectedModule.toLowerCase() === mod.toLowerCase()
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {mod} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-60">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-pt bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: GOOGLE DRIVE RECORDINGS LIST
           ------------------------------------------------------------- */}
        {activeTab === "drive" && (
          <div>
            {loadingDrive ? (
              <div className="space-y-3">
                <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
                <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
              </div>
            ) : filteredDriveRecordings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-xl mx-auto bg-surface/30">
                <PlayCircle size={48} className="mx-auto text-muted-foreground opacity-40 mb-3" />
                <h3 className="font-bold text-lg text-foreground">No Google Drive recordings yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {selectedModule === "all"
                    ? "Add your first Google Drive recording link so students have instant backup access."
                    : `No Google Drive recordings for "${selectedModule}". Click below to add one.`}
                </p>
                <Button onClick={openCreateDriveModal} className="mt-5" size="sm">
                  <Plus size={16} className="mr-1" />
                  Add Google Drive Link
                </Button>
              </div>
            ) : (
              <div className="grid gap-3.5">
                {filteredDriveRecordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 rounded-2xl border border-pt bg-gradient-to-br from-background to-surface/60 gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex gap-3.5 items-center flex-1 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xs border border-amber-500/20">
                        #{rec.classNumber}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {rec.title}
                          </h4>
                          {rec.level && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {rec.level}
                            </span>
                          )}
                        </div>
                        {rec.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                            {rec.notes}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground font-mono truncate max-w-md">
                          {rec.driveUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-xl border border-pt font-bold text-xs"
                      >
                        <a
                          href={rec.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5"
                        >
                          <ArrowSquareOut size={14} className="text-primary" />
                          Open
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border border-pt font-bold text-xs"
                        onClick={(e) => handleCopyLink(e, rec.driveUrl, rec.id)}
                        title="Copy Link"
                      >
                        {copiedId === rec.id ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border border-pt font-bold text-xs"
                        onClick={() => openEditDriveModal(rec)}
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border border-red-200/50 hover:bg-red-500/10 text-red-500 font-bold text-xs"
                        onClick={() => handleDeleteDriveRecording(rec.id)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: BUNNY STREAM HD RECORDINGS LIST
           ------------------------------------------------------------- */}
        {activeTab === "bunny" && (
          <div>
            {loadingBunny ? (
              <div className="space-y-3">
                <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
                <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
              </div>
            ) : filteredBunnyRecordings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-xl mx-auto bg-surface/30">
                <FilmStrip size={48} className="mx-auto text-muted-foreground opacity-40 mb-3" />
                <h3 className="font-bold text-lg text-foreground">No Bunny Stream recordings yet</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {selectedModule === "all"
                    ? "Upload high-definition video recordings for your students with DRM encryption and auto-resuming."
                    : `No Bunny Stream recordings for "${selectedModule}". Click below to upload a video.`}
                </p>
                <Button onClick={openCreateBunnyModal} className="mt-5" size="sm">
                  <Plus size={16} className="mr-1" />
                  Upload Bunny Video
                </Button>
              </div>
            ) : (
              <div className="grid gap-3.5">
                {filteredBunnyRecordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 rounded-2xl border border-pt bg-gradient-to-br from-background to-surface/60 gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex gap-3.5 items-center flex-1 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-xs border border-primary/20">
                        #{rec.order}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                            {rec.title}
                          </h4>
                          {rec.level && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {rec.level}
                            </span>
                          )}
                        </div>
                        {rec.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                            {rec.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1">
                            <Clock size={13} />
                            {formatDuration(rec.duration)}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-pt">
                            ID: {rec.bunnyVideoId || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border border-pt font-bold text-xs"
                        onClick={() => handlePreviewBunny(rec)}
                        disabled={uploadingBunny}
                      >
                        <Play size={14} weight="fill" className="mr-1 text-primary" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border border-pt font-bold text-xs"
                        onClick={() => openEditBunnyModal(rec)}
                        disabled={uploadingBunny}
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border border-red-200/50 hover:bg-red-500/10 text-red-500 font-bold text-xs"
                        onClick={() => handleDeleteBunny(rec.id)}
                        disabled={uploadingBunny}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          MODAL: CREATE / EDIT GOOGLE DRIVE RECORDING
         ------------------------------------------------------------- */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-pt bg-background p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  Google Drive Link Upload
                </span>
                <h3 className="text-xl font-bold text-foreground mt-0.5">
                  {editingDriveRec ? "Edit Google Drive Recording" : "Add Google Drive Recording"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
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
                  placeholder="e.g. Class 1: HTML Structure and Semantic Tags"
                  value={driveFormTitle}
                  onChange={(e) => setDriveFormTitle(e.target.value)}
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
                  placeholder="https://drive.google.com/file/d/... or YouTube / Loom link"
                  value={driveFormUrl}
                  onChange={(e) => setDriveFormUrl(e.target.value)}
                  required
                  className="w-full rounded-xl border border-pt bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Make sure Google Drive link access is set to &quot;Anyone with the link can view&quot;.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Class Notes / Homework instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Key concepts discussed, resources, or homework instructions..."
                  value={driveFormNotes}
                  onChange={(e) => setDriveFormNotes(e.target.value)}
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
                  {savingDrive ? "Saving..." : editingDriveRec ? "Update Recording" : "Save & Publish"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: CREATE / EDIT BUNNY STREAM RECORDING
         ------------------------------------------------------------- */}
      {isBunnyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-pt bg-background p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  Bunny Stream HD Video Upload
                </span>
                <h3 className="text-xl font-bold text-foreground mt-0.5">
                  {editingBunnyRec ? "Edit Class Recording" : "Upload HD Class Recording"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !uploadingBunny && setIsBunnyModalOpen(false)}
                disabled={uploadingBunny}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBunnyRecording} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Course Module *
                  </label>
                  <select
                    value={bunnyFormLevel}
                    onChange={(e) => handleBunnyModuleChange(e.target.value)}
                    disabled={uploadingBunny}
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
                    value={bunnyFormOrder}
                    onChange={(e) => setBunnyFormOrder(e.target.value)}
                    disabled={uploadingBunny}
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
                  value={bunnyFormTitle}
                  onChange={(e) => setBunnyFormTitle(e.target.value)}
                  disabled={uploadingBunny}
                  required
                  className="w-full rounded-xl border border-pt bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Description / Topic Summary (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What was covered in this live session..."
                  value={bunnyFormDescription}
                  onChange={(e) => setBunnyFormDescription(e.target.value)}
                  disabled={uploadingBunny}
                  className="w-full rounded-xl border border-pt bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Video File (MP4, MKV, MOV) {!editingBunnyRec && "*"}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={uploadingBunny}
                  required={!editingBunnyRec}
                  className="w-full rounded-xl border border-pt bg-surface px-3 py-2 text-xs font-semibold text-foreground file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                />
                {bunnyFormDuration && (
                  <p className="text-[11px] text-emerald-500 font-bold mt-1">
                    Auto-detected duration: {bunnyFormDuration} minutes
                  </p>
                )}
              </div>

              {uploadingBunny && (
                <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>Uploading directly to Bunny Stream CDN...</span>
                    <span>{bunnyUploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${bunnyUploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Please do not close this window while chunked resumable upload is in progress.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pt">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBunnyModalOpen(false)}
                  disabled={uploadingBunny}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={uploadingBunny}>
                  {uploadingBunny
                    ? `Uploading (${bunnyUploadProgress}%)...`
                    : editingBunnyRec
                    ? "Update Recording"
                    : "Upload & Publish"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: VIDEO PLAYER PREVIEW
         ------------------------------------------------------------- */}
      {previewRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl rounded-3xl border border-white/20 bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Bunny Stream DRM Player Preview
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  {previewRecording.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRecording(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-pt">
              {loadingPreview ? (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                  <ArrowClockwise size={20} className="animate-spin mr-2" />
                  Generating DRM token &amp; loading player...
                </div>
              ) : previewPlaybackUrl ? (
                <VideoPlayer
                  lectureId={previewRecording.id}
                  playbackUrl={previewPlaybackUrl}
                  onClose={() => setPreviewRecording(null)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-red-500 font-semibold">
                  Failed to load playback preview.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button size="sm" onClick={() => setPreviewRecording(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
