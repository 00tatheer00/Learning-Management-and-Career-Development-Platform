"use client";

import { useState } from "react";
import Image from "next/image";
import { PencilSimple, FloppyDisk, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { toast } from "@/lib/ui/toast";

export interface TrainerSettingsInitial {
  name: string;
  email: string;
  phone?: string;
  courseTitle: string;
  designation: string;
  experience?: string;
  bio?: string;
  expertise: string[];
  avatarUrl?: string;
  imagePosition?: string;
}

export function TrainerSettingsPanel({ initial }: { initial: TrainerSettingsInitial }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(initial);
  const [draft, setDraft] = useState(initial);

  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/trainer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name.trim(),
        phone: draft.phone?.trim(),
        designation: draft.designation.trim(),
        experience: draft.experience?.trim(),
        bio: draft.bio?.trim(),
        expertise: draft.expertise,
        avatarUrl: draft.avatarUrl?.trim(),
        imagePosition: draft.imagePosition?.trim(),
      }),
    });
    const data = await res.json();
    if (data.success) {
      const updated = { ...profile, ...data.data, email: profile.email, courseTitle: profile.courseTitle };
      setProfile(updated);
      setDraft(updated);
      setEditing(false);
      toast.success(data.message ?? "Profile updated.");
    } else {
      toast.error(data.error ?? data.message ?? "Update failed.");
    }
    setSaving(false);
  };

  const photo = profile.avatarUrl;

  return (
    <div>
      <PortalPageHeader
        title="Trainer Settings"
        description="Update how students see your profile in the portal."
      >
        {!editing ? (
          <Button size="lg" className="gap-2" onClick={startEdit}>
            <PencilSimple size={18} />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" className="gap-2" onClick={cancelEdit}>
              <X size={18} />
              Cancel
            </Button>
            <Button size="lg" className="gap-2" disabled={saving} onClick={() => void save()}>
              <FloppyDisk size={18} />
              Save Changes
            </Button>
          </div>
        )}
      </PortalPageHeader>

      <div className="rounded-2xl border border-border bg-background max-w-2xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center gap-4">
          {photo ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30">
              <Image
                src={photo}
                alt={profile.name}
                fill
                className="object-cover"
                style={{ objectPosition: profile.imagePosition ?? "center" }}
                sizes="80px"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold">
              {profile.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xl font-bold">{editing ? draft.name : profile.name}</p>
            <p className="text-sm opacity-90">{editing ? draft.designation : profile.designation}</p>
            <p className="text-xs opacity-75 mt-1">{profile.courseTitle}</p>
          </div>
        </div>

        {editing ? (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium">Name</span>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="mt-1.5"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Designation</span>
                <Input
                  value={draft.designation}
                  onChange={(e) => setDraft({ ...draft, designation: e.target.value })}
                  className="mt-1.5"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium">Phone / WhatsApp</span>
              <Input
                value={draft.phone ?? ""}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className="mt-1.5"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Experience</span>
              <Input
                value={draft.experience ?? ""}
                onChange={(e) => setDraft({ ...draft, experience: e.target.value })}
                className="mt-1.5"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Photo URL</span>
              <Input
                value={draft.avatarUrl ?? ""}
                onChange={(e) => setDraft({ ...draft, avatarUrl: e.target.value })}
                className="mt-1.5"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Image position</span>
              <Input
                value={draft.imagePosition ?? ""}
                onChange={(e) => setDraft({ ...draft, imagePosition: e.target.value })}
                placeholder="center 15%"
                className="mt-1.5"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Skills (comma separated)</span>
              <textarea
                value={draft.expertise.join(", ")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    expertise: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                rows={3}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Bio</span>
              <textarea
                value={draft.bio ?? ""}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <p className="text-xs text-muted">
              Email ({profile.email}) and course are managed by admin.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[
              { label: "Email", value: profile.email },
              { label: "Phone", value: profile.phone ?? "—" },
              { label: "Experience", value: profile.experience ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-4">
                <p className="text-xs text-muted uppercase">{label}</p>
                <p className="font-medium mt-0.5">{value}</p>
              </div>
            ))}
            {profile.expertise.length > 0 && (
              <div className="px-6 py-4">
                <p className="text-xs text-muted uppercase mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.bio && (
              <div className="px-6 py-4">
                <p className="text-xs text-muted uppercase mb-1">Bio</p>
                <p className="text-sm leading-relaxed text-muted">{profile.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
