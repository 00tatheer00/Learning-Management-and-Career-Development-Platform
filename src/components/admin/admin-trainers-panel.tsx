"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Envelope,
  Phone,
  BookOpen,
  Users,
  PencilSimple,
  GraduationCap,
  Plus,
  Trash,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";
import type { AdminProgramStats } from "@/lib/api/admin-program-stats";
import { toast } from "@/lib/ui/toast";
import type { AdminTrainerRow } from "@/lib/api/admin-trainers";

interface AdminTrainersPanelProps {
  trainers: AdminTrainerRow[];
  programStats: AdminProgramStats;
}

type FormMode = "edit" | "create";

const emptyCreateForm = {
  name: "",
  email: "",
  password: "",
  programSlug: ENROLLABLE_PROGRAM_SLUGS[0],
  phone: "",
  designation: "",
  experience: "",
  bio: "",
  expertiseText: "",
  avatarUrl: "",
  imagePosition: "center",
};

export function AdminTrainersPanel({
  trainers: initialTrainers,
  programStats: initialProgramStats,
}: AdminTrainersPanelProps) {
  const [trainers, setTrainers] = useState(initialTrainers);
  const [programStats, setProgramStats] = useState(initialProgramStats);
  const [programFilter, setProgramFilter] = useState("all");
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editTrainer, setEditTrainer] = useState<AdminTrainerRow | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [programSlug, setProgramSlug] = useState<string>(ENROLLABLE_PROGRAM_SLUGS[0]);
  const [designation, setDesignation] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [expertiseText, setExpertiseText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imagePosition, setImagePosition] = useState("");

  const filtered = useMemo(() => {
    if (programFilter === "all") return trainers;
    return trainers.filter((trainer) => trainer.programSlug === programFilter);
  }, [trainers, programFilter]);

  const totalStudents = useMemo(
    () => trainers.reduce((sum, trainer) => sum + trainer.studentCount, 0),
    [trainers]
  );

  const refreshTrainers = async () => {
    const res = await fetch("/api/admin/trainers");
    const data = await res.json();
    if (data.success && data.data) {
      setTrainers(data.data);
    }
  };

  const runSync = async () => {
    setSyncing(true);
    const res = await fetch("/api/admin/sync", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message ?? "Sync complete.");
      if (data.data?.stats) setProgramStats(data.data.stats);
      await refreshTrainers();
    } else {
      toast.error(data.error ?? data.message ?? "Sync failed.");
    }
    setSyncing(false);
  };

  const openCreate = () => {
    setFormMode("create");
    setEditTrainer(null);
    setName(emptyCreateForm.name);
    setEmail(emptyCreateForm.email);
    setPassword(emptyCreateForm.password);
    setProgramSlug(emptyCreateForm.programSlug);
    setPhone(emptyCreateForm.phone);
    setDesignation(emptyCreateForm.designation);
    setExperience(emptyCreateForm.experience);
    setBio(emptyCreateForm.bio);
    setExpertiseText(emptyCreateForm.expertiseText);
    setAvatarUrl(emptyCreateForm.avatarUrl);
    setImagePosition(emptyCreateForm.imagePosition);
  };

  const openEdit = (trainer: AdminTrainerRow) => {
    setFormMode("edit");
    setEditTrainer(trainer);
    setName(trainer.name);
    setPhone(trainer.phone ?? "");
    setEmail(trainer.email);
    setProgramSlug(trainer.programSlug ?? ENROLLABLE_PROGRAM_SLUGS[0]);
    setDesignation(trainer.designation);
    setExperience(trainer.experience ?? "");
    setBio(trainer.bio);
    setExpertiseText(trainer.expertise.join(", "));
    setAvatarUrl(trainer.avatarUrl ?? trainer.fallbackImage ?? "");
    setImagePosition(trainer.imagePosition ?? "center");
  };

  const closeForm = () => {
    setFormMode(null);
    setEditTrainer(null);
  };

  const parseExpertise = () =>
    expertiseText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const saveForm = async () => {
    if (formMode === "create") {
      setLoadingId("create");
      const res = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          programSlug,
          phone: phone.trim(),
          designation: designation.trim(),
          experience: experience.trim(),
          bio: bio.trim(),
          expertise: parseExpertise(),
          avatarUrl: avatarUrl.trim(),
          imagePosition: imagePosition.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message ?? "Trainer created.");
        await refreshTrainers();
        closeForm();
      } else {
        toast.error(data.error ?? data.message ?? "Create failed.");
      }
      setLoadingId(null);
      return;
    }

    if (!editTrainer) return;
    setLoadingId(editTrainer.id);

    const res = await fetch("/api/admin/trainers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editTrainer.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        programSlug,
        designation: designation.trim(),
        experience: experience.trim(),
        bio: bio.trim(),
        expertise: parseExpertise(),
        avatarUrl: avatarUrl.trim(),
        imagePosition: imagePosition.trim(),
      }),
    });

    const data = await res.json();
    if (data.success) {
      await refreshTrainers();
      toast.success(data.message ?? "Trainer profile updated.");
      closeForm();
    } else {
      toast.error(data.message ?? data.error ?? "Update failed.");
    }

    setLoadingId(null);
  };

  const deleteTrainer = async (trainer: AdminTrainerRow) => {
    if (
      !window.confirm(
        `Delete ${trainer.name}? This cannot be undone. Students must be reassigned first.`
      )
    ) {
      return;
    }

    setLoadingId(trainer.id);
    const res = await fetch("/api/admin/trainers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: trainer.id }),
    });
    const data = await res.json();
    if (data.success) {
      setTrainers((current) => current.filter((row) => row.id !== trainer.id));
      toast.success(data.message ?? "Trainer deleted.");
    } else {
      toast.error(data.error ?? data.message ?? "Delete failed.");
    }
    setLoadingId(null);
  };

  return (
    <div>
      <PortalPageHeader
        title="Trainers by Program"
        description="Add, edit, or remove trainers. Student counts match active portal accounts assigned to each trainer."
      >
        <div className="flex flex-wrap gap-2">
          {programStats.missingTrainerAssignments > 0 && (
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-amber-300 text-amber-900"
              disabled={syncing}
              onClick={() => void runSync()}
            >
              <ArrowsClockwise size={18} className={syncing ? "animate-spin" : ""} />
              Sync assignments ({programStats.missingTrainerAssignments})
            </Button>
          )}
          <Button size="lg" className="gap-2" onClick={openCreate}>
            <Plus size={18} weight="bold" />
            Add Trainer
          </Button>
        </div>
      </PortalPageHeader>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted">Total Trainers</p>
          <p className="text-2xl font-bold">{trainers.length}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">Assigned Students</p>
          <p className="text-2xl font-bold text-blue-900">{totalStudents}</p>
          <p className="text-xs text-blue-700/80 mt-1">
            {programStats.activeStudents} active accounts
          </p>
        </div>
        {programStats.byProgram.map((row) => {
          const category = getProgramCategory(row.programSlug);
          return (
            <div key={row.programSlug} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800">{category?.shortLabel ?? row.programSlug}</p>
              <p className="text-2xl font-bold text-emerald-900">{row.trainerAssigned}</p>
              <p className="text-xs text-emerald-700/80 mt-1">
                {row.students} students · {row.registrations} registrations
              </p>
            </div>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setProgramFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            programFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background text-muted hover:text-foreground"
          }`}
        >
          All ({trainers.length})
        </button>
        {ENROLLABLE_PROGRAM_SLUGS.map((slug) => {
          const category = getProgramCategory(slug);
          const count = trainers.filter((trainer) => trainer.programSlug === slug).length;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => setProgramFilter(slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                programFilter === slug
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted hover:text-foreground"
              }`}
            >
              {category?.shortLabel ?? slug} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">No trainers found for this filter.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((trainer) => {
            const photo = trainer.avatarUrl ?? trainer.fallbackImage;
            return (
              <div
                key={trainer.id}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {photo ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border">
                      <Image
                        src={photo}
                        alt={trainer.name}
                        fill
                        className="object-cover"
                        style={{ objectPosition: trainer.imagePosition ?? "center" }}
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                      {trainer.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-lg">{trainer.name}</p>
                        <p className="text-sm text-primary">{trainer.designation}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                        <Users size={14} weight="duotone" />
                        {trainer.studentCount} student{trainer.studentCount === 1 ? "" : "s"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted flex items-center gap-2">
                      <BookOpen size={16} weight="duotone" className="text-primary" />
                      {trainer.courseTitle}
                    </p>

                    {trainer.expertise.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {trainer.expertise.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 space-y-1.5 text-sm text-muted">
                      <p className="flex items-center gap-2">
                        <Envelope size={16} weight="duotone" className="text-primary" />
                        {trainer.email}
                      </p>
                      {trainer.phone && (
                        <p className="flex items-center gap-2">
                          <Phone size={16} weight="duotone" className="text-primary" />
                          {trainer.phone}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-2"
                        onClick={() => openEdit(trainer)}
                      >
                        <PencilSimple size={16} />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={loadingId === trainer.id}
                        onClick={() => void deleteTrainer(trainer)}
                      >
                        <Trash size={16} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={formMode !== null}
        onClose={closeForm}
        title={formMode === "create" ? "Add Trainer" : "Edit Trainer Profile"}
        className="max-w-xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium">Name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Designation</span>
              <Input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="mt-1.5"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Phone / WhatsApp</span>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
            </label>
          </div>

          {formMode === "create" && (
            <label className="block text-sm">
              <span className="font-medium">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
                placeholder="Min 6 characters"
              />
            </label>
          )}

          <label className="block text-sm">
            <span className="font-medium">Course</span>
            <select
              value={programSlug}
              onChange={(e) => setProgramSlug(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {ENROLLABLE_PROGRAM_SLUGS.map((slug) => {
                const category = getProgramCategory(slug);
                return (
                  <option key={slug} value={slug}>
                    {category?.title ?? slug}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-medium">Experience</span>
            <Input
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 4+ years"
              className="mt-1.5"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium">Photo URL</span>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://... or /trainers/name.png"
              className="mt-1.5"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium">Image crop position</span>
            <Input
              value={imagePosition}
              onChange={(e) => setImagePosition(e.target.value)}
              placeholder="center 15%"
              className="mt-1.5"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium">Skills (comma separated)</span>
            <textarea
              value={expertiseText}
              onChange={(e) => setExpertiseText(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          {formMode === "edit" && editTrainer && (
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
              <GraduationCap size={18} weight="duotone" />
              {editTrainer.studentCount} student(s) assigned to this trainer
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
            <Button
              disabled={loadingId !== null}
              onClick={() => void saveForm()}
            >
              {formMode === "create" ? "Create Trainer" : "Save Profile"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
