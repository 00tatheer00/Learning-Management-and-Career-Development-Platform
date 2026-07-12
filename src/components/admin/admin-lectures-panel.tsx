"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Trash, ArrowClockwise, FilmStrip, Pencil, CloudArrowUp, X, Clock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import { programs } from "@/lib/data/programs";
import * as tus from "tus-js-client";

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

export function AdminLecturesPanel() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProgramSlug, setActiveProgramSlug] = useState<string>("web-development");

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formProgramSlug, setFormProgramSlug] = useState("web-development");
  const [formLevel, setFormLevel] = useState("");
  const [formOrder, setFormOrder] = useState("1");
  const [formDuration, setFormDuration] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload progress states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch all lectures
  const loadLectures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/lectures", {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        setLectures(json.data || []);
      } else {
        toast.error(json.error ?? "Failed to load lectures");
      }
    } catch {
      toast.error("Failed to load lectures");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLectures();
  }, [loadLectures]);

  // Dynamically get modules for selected program
  const activeProgram = useMemo(() => {
    return programs.find((p) => p.slug === formProgramSlug);
  }, [formProgramSlug]);

  useEffect(() => {
    if (activeProgram && activeProgram.modules.length > 0) {
      setFormLevel(activeProgram.modules[0].name);
    } else {
      setFormLevel("");
    }
  }, [activeProgram]);

  // Open modal for creating a new lecture
  const openCreateModal = () => {
    setEditingLecture(null);
    setFormTitle("");
    setFormDescription("");
    setFormProgramSlug(activeProgramSlug);
    const programLectures = lectures.filter((l) => l.programSlug === activeProgramSlug);
    const nextOrder = programLectures.length > 0 
      ? Math.max(...programLectures.map((l) => l.order)) + 1 
      : 1;
    setFormOrder(nextOrder.toString());
    setFormDuration("");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // Open modal for editing a lecture
  const openEditModal = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormTitle(lecture.title);
    setFormDescription(lecture.description);
    setFormProgramSlug(lecture.programSlug);
    setFormLevel(lecture.level || "");
    setFormOrder(lecture.order.toString());
    setFormDuration(lecture.duration ? (lecture.duration / 60).toFixed(1) : ""); // Convert to minutes for UI
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // Delete lecture
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lecture? This will also remove the video from Bunny Stream.")) return;

    try {
      const res = await fetch(`/api/admin/lectures/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Lecture deleted successfully");
        void loadLectures();
      } else {
        toast.error(json.error ?? "Failed to delete lecture");
      }
    } catch {
      toast.error("Failed to delete lecture");
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
          const mins = (video.duration / 60).toFixed(1);
          setFormDuration(mins);
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
      } catch (err) {
        console.error("Auto duration detection failed:", err);
      }
    }
  };

  // Form submission with direct client-side TUS upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!editingLecture && !selectedFile) {
      toast.error("Please select a video file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (selectedFile) {
        // 1. Call prepare endpoint to create video in Bunny and get signature
        const prepRes = await fetch("/api/admin/lectures/prepare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: formTitle }),
        });
        const prepJson = await prepRes.json();

        if (!prepJson.success) {
          setUploading(false);
          toast.error(prepJson.error ?? "Failed to prepare upload");
          return;
        }

        const { libraryId, videoId, signature, expirationTime } = prepJson.data;

        // 3. Start TUS upload direct to Bunny Stream
        const upload = new tus.Upload(selectedFile, {
          endpoint: "https://video.bunnycdn.com/tusupload",
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            AuthorizationSignature: signature,
            AuthorizationExpire: expirationTime.toString(),
            LibraryId: libraryId,
            VideoId: videoId,
          },
          metadata: {
            filename: selectedFile.name,
            filetype: selectedFile.type,
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
            // 4. Finalize lecture save in database
            try {
              const res = await fetch("/api/admin/lectures/finalize", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: formTitle,
                  description: formDescription,
                  programSlug: formProgramSlug,
                  level: formLevel,
                  order: formOrder,
                  duration: formDuration ? (parseFloat(formDuration) * 60).toString() : null,
                  bunnyVideoId: videoId,
                  lectureId: editingLecture?.id || null,
                }),
              });
              const json = await res.json();
              setUploading(false);
              if (json.success) {
                toast.success(editingLecture ? "Lecture updated successfully!" : "Lecture uploaded and created successfully!");
                setIsModalOpen(false);
                void loadLectures();
              } else {
                toast.error(json.error ?? "Failed to finalize lecture");
              }
            } catch {
              setUploading(false);
              toast.error("Failed to finalize lecture");
            }
          },
        });
        upload.start();
      } else {
        // Editing metadata only (no file to upload)
        const res = await fetch("/api/admin/lectures/finalize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
            programSlug: formProgramSlug,
            level: formLevel,
            order: formOrder,
            duration: formDuration ? (parseFloat(formDuration) * 60).toString() : null,
            bunnyVideoId: editingLecture?.bunnyVideoId || "",
            lectureId: editingLecture?.id || null,
          }),
        });
        const json = await res.json();
        setUploading(false);
        if (json.success) {
          toast.success("Lecture details updated successfully!");
          setIsModalOpen(false);
          void loadLectures();
        } else {
          toast.error(json.error ?? "Failed to update lecture");
        }
      }
    } catch (error) {
      setUploading(false);
      const errMessage = error instanceof Error ? error.message : "Failed to process upload request";
      toast.error(errMessage);
    }
  };

  // Filter lectures for active course
  const filteredLectures = useMemo(() => {
    return lectures
      .filter((l) => l.programSlug === activeProgramSlug)
      .sort((a, b) => a.order - b.order);
  }, [lectures, activeProgramSlug]);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Admin Portal"
        title="Manage Lectures"
        description="Add, replace, and delete securely hosted Bunny Stream video lectures."
      >
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void loadLectures()} disabled={loading || uploading}>
            <ArrowClockwise size={18} className={cn(loading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={openCreateModal} disabled={uploading}>
            <Plus size={18} />
            Add Lecture
          </Button>
        </div>
      </PortalPageHeader>

      {/* Program switcher */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
        {programs
          .filter((p) => p.category === "active")
          .map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProgramSlug(p.slug)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors shrink-0 whitespace-nowrap",
                activeProgramSlug === p.slug
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              {p.title}
              <span className="ml-2 text-xs opacity-75">
                ({lectures.filter((l) => l.programSlug === p.slug).length})
              </span>
            </button>
          ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
          <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
          <div className="h-20 w-full rounded-2xl bg-muted animate-pulse" />
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-xl mx-auto">
          <FilmStrip size={48} className="mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-bold text-lg">No lectures found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            You haven&apos;t uploaded any video lectures for this program yet. Click &quot;Add Lecture&quot; to upload your first secure video.
          </p>
          <Button onClick={openCreateModal} className="mt-6">
            <Plus size={16} className="mr-1" />
            Upload First Video
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredLectures.map((lecture) => (
            <div
              key={lecture.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-border bg-background gap-5 hover:border-primary/45 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex gap-4 items-center flex-1 min-w-0">
                {/* Premium Order Badge */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-pt font-extrabold text-sm border border-border group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                  #{lecture.order}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center flex-wrap gap-2">
                    <h4 className="font-extrabold text-lg text-pt leading-snug group-hover:text-primary transition-colors">
                      {lecture.title}
                    </h4>
                    {lecture.level && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {lecture.level}
                      </span>
                    )}
                  </div>
                  {lecture.description && (
                    <p className="text-sm text-pt-muted line-clamp-1 max-w-xl">{lecture.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-pt-muted font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {lecture.duration ? (
                        <span>{(lecture.duration / 60).toFixed(1)} mins</span>
                      ) : (
                        <span className="text-amber-500 font-semibold">No duration</span>
                      )}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] bg-muted px-2 py-0.5 rounded text-pt-faint border border-border">
                      GUID: {lecture.bunnyVideoId || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 self-end md:self-center shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border border-border bg-background hover:bg-muted text-pt-muted font-bold transition-all px-3"
                  onClick={() => openEditModal(lecture)}
                  disabled={uploading}
                >
                  <Pencil size={15} className="mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border border-red-200/50 bg-background hover:bg-red-500/10 text-red-500 font-bold transition-all px-3"
                  onClick={() => handleDelete(lecture.id)}
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
              {editingLecture ? "Edit Lecture" : "Upload New Lecture"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {editingLecture ? "Modify lecture details or replace its secure video file." : "Add a video lecture directly to Bunny Stream."}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Lecture Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Introduction to CSS Grid"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What will students learn in this video?"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
                  disabled={uploading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Course / Program
                  </label>
                  <select
                    value={formProgramSlug}
                    onChange={(e) => setFormProgramSlug(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    disabled={uploading}
                  >
                    {programs
                      .filter((p) => p.category === "active")
                      .map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Module / Level
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    disabled={uploading || !activeProgram || activeProgram.modules.length === 0}
                  >
                    {activeProgram?.modules.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Sort Order
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 15.5 (optional)"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    disabled={uploading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Video File {editingLecture ? "(Optional: select only to replace)" : ""}
                </label>
                <div className="relative border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <CloudArrowUp size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    {selectedFile ? selectedFile.name : "Drag & drop or click to browse video file"}
                  </p>
                  {selectedFile && (
                    <p className="text-[10px] text-primary mt-1">
                      Size: {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-2 py-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-primary animate-pulse">Uploading secure video to Bunny Stream...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
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
                  {uploading ? "Uploading..." : editingLecture ? "Save Changes" : "Upload Video"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
