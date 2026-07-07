"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, EnvelopeSimple, Prohibit, ShareNetwork, Users } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import {
  chunkEmailsForDriveShare,
  DRIVE_SHARE_LIMITS,
  DRIVE_SHARE_LIMITS_SUMMARY,
  formatEmailsForDriveShare,
  getDriveBatchLabel,
} from "@/lib/utils/drive-share";
import {
  DRIVE_DOWNLOAD_LIMITATION,
  DRIVE_DOWNLOAD_NOTE,
  DRIVE_SHARE_STEPS,
} from "@/lib/constants/drive-sharing-guide";
import { getFirstModuleName } from "@/lib/modules/student-module-access";
import { groupStudentsByModule } from "@/lib/trainer/group-students-by-module";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";

export interface DriveAccessStudent {
  id: string;
  name: string;
  email: string;
  level?: string | null;
}

interface TrainerDriveAccessPanelProps {
  students: DriveAccessStudent[];
  programSlug: string;
  courseTitle: string;
}

export function TrainerDriveAccessPanel({
  students,
  programSlug,
  courseTitle,
}: TrainerDriveAccessPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeBatchIndex, setActiveBatchIndex] = useState(0);

  const firstModuleName = getFirstModuleName(programSlug);
  const moduleGroups = useMemo(
    () =>
      groupStudentsByModule(
        students.map((student) => ({
          ...student,
          level: student.level ?? undefined,
        })),
        programSlug
      ),
    [students, programSlug]
  );

  const selectedModule =
    activeModule ?? firstModuleName ?? moduleGroups[0]?.moduleName ?? null;

  const selectedGroup = moduleGroups.find((group) => group.moduleName === selectedModule);

  useEffect(() => {
    setActiveBatchIndex(0);
  }, [selectedModule]);

  const selectedEmails = useMemo(
    () =>
      (selectedGroup?.students ?? [])
        .map((student) => student.email?.trim().toLowerCase())
        .filter(Boolean),
    [selectedGroup]
  );
  const emailBatches = useMemo(
    () => chunkEmailsForDriveShare(selectedEmails),
    [selectedEmails]
  );

  const safeBatchIndex = Math.min(activeBatchIndex, Math.max(0, emailBatches.length - 1));
  const activeBatchEmails = emailBatches[safeBatchIndex] ?? [];
  const emailBlob = useMemo(
    () => formatEmailsForDriveShare(activeBatchEmails),
    [activeBatchEmails]
  );

  const copyEmails = useCallback(async (key: string, emails: string[], successDetail?: string) => {
    if (emails.length === 0) {
      toast.warning("No students", "No emails in this batch.");
      return;
    }

    const blob = formatEmailsForDriveShare(emails);
    try {
      await navigator.clipboard.writeText(blob);
      setCopiedKey(key);
      toast.success(
        "Batch copied!",
        successDetail ?? "Paste into Google Drive → Share → Add people → Send."
      );
      window.setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      setActiveBatchIndex(emailBatches.findIndex((batch) => batch === emails));
      textareaRef.current?.focus();
      textareaRef.current?.select();
      toast.info("Select & copy", "Emails are selected — press Ctrl+C to copy.");
    }
  }, [emailBatches]);

  const copyModuleFirstBatch = useCallback(
    (moduleName: string, emails: string[]) => {
      const batches = chunkEmailsForDriveShare(emails);
      const first = batches[0] ?? [];
      const detail =
        batches.length > 1
          ? `${getDriveBatchLabel(0, batches.length, first.length)} copied. Paste in Drive, then copy Batch 2.`
          : "Paste into Google Drive → Share → Add people.";
      void copyEmails(`module-${moduleName}-0`, first, detail);
    },
    [copyEmails]
  );

  const selectAllInBox = () => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  };

  return (
    <div>
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title="Drive Access"
        description={`Copy portal student emails by module for ${courseTitle}. Share recordings only with the module that is live.`}
      />

      <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShareNetwork size={22} weight="duotone" />
          </span>
          <div>
            <p className="font-bold text-pt">Module-wise Drive sharing</p>
            <ol className="mt-2 text-sm text-pt-muted space-y-1.5 list-decimal list-inside">
              {DRIVE_SHARE_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {firstModuleName && (
              <p className="mt-3 text-sm rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-pt">
                <strong>Right now:</strong> only share class recordings with{" "}
                <strong>{firstModuleName}</strong> emails. Other modules start next month.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <Prohibit size={20} weight="duotone" />
          </span>
          <div className="text-sm">
            <p className="font-bold text-pt">Block downloads on Drive</p>
            <p className="mt-1 text-pt-muted">{DRIVE_DOWNLOAD_NOTE}</p>
            <p className="mt-2 text-xs text-pt-muted">{DRIVE_DOWNLOAD_LIMITATION}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4 sm:p-5">
        <p className="font-bold text-pt text-sm">Google Drive limits</p>
        <p className="mt-1.5 text-sm text-pt-muted">{DRIVE_SHARE_LIMITS_SUMMARY}</p>
        <ul className="mt-3 text-xs text-pt-muted space-y-1">
          <li>
            • Max <strong className="text-pt">{DRIVE_SHARE_LIMITS.maxEmailsPerFile}</strong> people per
            file (total)
          </li>
          <li>
            • Portal batches:{" "}
            <strong className="text-pt">{DRIVE_SHARE_LIMITS.recommendedPasteBatch}</strong> emails per
            paste (recommended)
          </li>
          <li>
            • Max <strong className="text-pt">{DRIVE_SHARE_LIMITS.maxInvitesPerDay}</strong> share
            invitations per day
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {moduleGroups.map((group) => {
          const isFirst = group.moduleName === firstModuleName;
          const isActive = group.moduleName === selectedModule;
          const emails = group.students
            .map((s) => s.email?.trim().toLowerCase())
            .filter(Boolean);

          return (
            <button
              key={group.moduleName}
              type="button"
              onClick={() => {
                setActiveModule(group.moduleName);
                setActiveBatchIndex(0);
              }}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition-all",
                isActive
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-pt bg-background hover:border-primary/30"
              )}
            >
              <p className="text-xs font-bold text-pt">{group.moduleName}</p>
              <p className="text-[10px] text-pt-muted mt-0.5">
                {group.students.length} student{group.students.length === 1 ? "" : "s"}
                {isFirst ? " · Live now" : " · Starts later"}
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-2 h-7 text-[10px] gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  copyModuleFirstBatch(group.moduleName, emails);
                }}
              >
                {copiedKey === `module-${group.moduleName}-0` ? (
                  <Check size={12} weight="bold" />
                ) : (
                  <Copy size={12} />
                )}
                Copy batch 1
              </Button>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-pt bg-background p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} weight="duotone" className="text-primary" />
            <h2 className="font-bold text-pt">
              {selectedModule ?? "Students"} ({selectedGroup?.students.length ?? 0})
            </h2>
          </div>

          {!selectedGroup || selectedGroup.students.length === 0 ? (
            <p className="text-sm text-pt-muted">No students in this module yet.</p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto space-y-2">
              {selectedGroup.students.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-pt/70 bg-surface/40 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-pt truncate">{student.name}</span>
                  <span className="text-xs text-pt-muted truncate">{student.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-pt bg-background p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <EnvelopeSimple size={20} weight="duotone" className="text-primary" />
            <h2 className="font-bold text-pt">
              {selectedModule ? `${selectedModule} emails` : "Emails for Google Drive"}
            </h2>
          </div>
          <p className="text-xs text-pt-muted mb-3">
            {selectedEmails.length > DRIVE_SHARE_LIMITS.recommendedPasteBatch
              ? `${emailBatches.length} batches for this module — copy and paste one batch at a time in Drive.`
              : "Comma-separated for one Drive Share paste."}
          </p>

          {emailBatches.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {emailBatches.map((batch, index) => {
                const key = `batch-${selectedModule}-${index}`;
                const isActive = index === safeBatchIndex;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveBatchIndex(index)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all",
                      isActive
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-pt text-pt-muted hover:border-primary/30"
                    )}
                  >
                    {getDriveBatchLabel(index, emailBatches.length, batch.length)}
                  </button>
                );
              })}
            </div>
          )}

          {emailBatches.length > 1 && (
            <p className="text-xs font-medium text-pt mb-2">
              {getDriveBatchLabel(safeBatchIndex, emailBatches.length, activeBatchEmails.length)}
            </p>
          )}
          <textarea
            ref={textareaRef}
            readOnly
            value={emailBlob}
            onClick={selectAllInBox}
            className="w-full min-h-[220px] rounded-xl border border-pt bg-surface/30 px-4 py-3 text-sm font-mono text-pt focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={selectAllInBox} disabled={!emailBlob}>
              Select all
            </Button>
            <Button
              size="sm"
              onClick={() =>
                selectedModule &&
                copyEmails(
                  `batch-${selectedModule}-${safeBatchIndex}`,
                  activeBatchEmails,
                  emailBatches.length > 1
                    ? `Paste Batch ${safeBatchIndex + 1} in Drive, click Send, then copy the next batch.`
                    : undefined
                )
              }
              disabled={!emailBlob || !selectedModule}
              className="gap-1.5"
            >
              <Copy size={14} />
              {emailBatches.length > 1 ? `Copy batch ${safeBatchIndex + 1}` : "Copy for Drive"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
