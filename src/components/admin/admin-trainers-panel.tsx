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
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { toast } from "@/lib/ui/toast";
import type { AdminTrainerRow } from "@/lib/api/admin-trainers";

interface AdminTrainersPanelProps {
  trainers: AdminTrainerRow[];
}

export function AdminTrainersPanel({ trainers: initialTrainers }: AdminTrainersPanelProps) {
  const [trainers, setTrainers] = useState(initialTrainers);
  const [programFilter, setProgramFilter] = useState("all");
  const [editTrainer, setEditTrainer] = useState<AdminTrainerRow | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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

  const openEdit = (trainer: AdminTrainerRow) => {
    setEditTrainer(trainer);
    setName(trainer.name);
    setPhone(trainer.phone ?? "");
    setEmail(trainer.email);
    setDesignation(trainer.designation);
    setExperience(trainer.experience ?? "");
    setBio(trainer.bio);
    setExpertiseText(trainer.expertise.join(", "));
    setAvatarUrl(trainer.avatarUrl ?? trainer.fallbackImage ?? "");
    setImagePosition(trainer.imagePosition ?? "center");
  };

  const saveEdit = async () => {
    if (!editTrainer) return;
    setLoadingId(editTrainer.id);

    const expertise = expertiseText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const res = await fetch("/api/admin/trainers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editTrainer.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        designation: designation.trim(),
        experience: experience.trim(),
        bio: bio.trim(),
        expertise,
        avatarUrl: avatarUrl.trim(),
        imagePosition: imagePosition.trim(),
      }),
    });

    const data = await res.json();
    if (data.success) {
      setTrainers((current) =>
        current.map((trainer) =>
          trainer.id === editTrainer.id
            ? {
                ...trainer,
                name: name.trim(),
                phone: phone.trim() || undefined,
                email: email.trim(),
                designation: designation.trim(),
                experience: experience.trim() || undefined,
                bio: bio.trim(),
                expertise,
                avatarUrl: avatarUrl.trim() || undefined,
                imagePosition: imagePosition.trim() || undefined,
              }
            : trainer
        )
      );
      toast.success(data.message ?? "Trainer profile updated.");
      setEditTrainer(null);
    } else {
      toast.error(data.message ?? data.error ?? "Update failed.");
    }

    setLoadingId(null);
  };

  return (
    <div>
      <PortalPageHeader
        title="Trainers by Program"
        description="View student counts and edit trainer profile details shown in the student portal."
      />

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted">Total Trainers</p>
          <p className="text-2xl font-bold">{trainers.length}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">Assigned Students</p>
          <p className="text-2xl font-bold text-blue-900">{totalStudents}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">Web + App Programs</p>
          <p className="text-2xl font-bold text-emerald-900">
            {ENROLLABLE_PROGRAM_SLUGS.length}
          </p>
        </div>
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
                        {trainer.expertise.length > 6 && (
                          <span className="text-[11px] text-muted">
                            +{trainer.expertise.length - 6} more
                          </span>
                        )}
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

                    {trainer.bio && (
                      <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-2">
                        {trainer.bio}
                      </p>
                    )}

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-4 gap-2"
                      onClick={() => openEdit(trainer)}
                    >
                      <PencilSimple size={16} />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(editTrainer)}
        onClose={() => setEditTrainer(null)}
        title="Edit Trainer Profile"
      >
        {editTrainer && (
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
                placeholder="React, Next.js, Node.js"
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

            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
              <GraduationCap size={18} weight="duotone" />
              {editTrainer.studentCount} student(s) currently assigned to this trainer
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditTrainer(null)}>
                Cancel
              </Button>
              <Button disabled={loadingId === editTrainer.id} onClick={() => void saveEdit()}>
                Save Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
