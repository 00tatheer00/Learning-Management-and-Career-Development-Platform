"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Check, Copy, EnvelopeSimple, Prohibit, ShareNetwork, Users } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { formatEmailsForDriveShare } from "@/lib/utils/drive-share";
import {
  DRIVE_DOWNLOAD_LIMITATION,
  DRIVE_DOWNLOAD_NOTE,
  DRIVE_SHARE_STEPS,
} from "@/lib/constants/drive-sharing-guide";
import { toast } from "@/lib/ui/toast";

export interface DriveAccessStudent {
  id: string;
  name: string;
  email: string;
}

interface TrainerDriveAccessPanelProps {
  students: DriveAccessStudent[];
  courseTitle: string;
}

export function TrainerDriveAccessPanel({
  students,
  courseTitle,
}: TrainerDriveAccessPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  const emails = useMemo(
    () => students.map((student) => student.email.trim().toLowerCase()).filter(Boolean),
    [students]
  );

  const emailBlob = useMemo(() => formatEmailsForDriveShare(emails), [emails]);

  const copyEmails = useCallback(async () => {
    if (emails.length === 0) {
      toast.warning("No students", "No active portal students to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(emailBlob);
      setCopied(true);
      toast.success("Emails copied!", "Paste into Google Drive → Share → Add people.");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      textareaRef.current?.focus();
      textareaRef.current?.select();
      toast.info("Select & copy", "Emails are selected — press Ctrl+C to copy.");
    }
  }, [emailBlob, emails.length]);

  const selectAllInBox = () => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  };

  return (
    <div>
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title="Drive Access"
        description={`Only these ${courseTitle} portal students should get recording access on Google Drive.`}
      >
        <Button size="lg" onClick={copyEmails} disabled={emails.length === 0} className="gap-2">
          {copied ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
          {copied ? "Copied!" : "Copy all emails"}
        </Button>
      </PortalPageHeader>

      <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShareNetwork size={22} weight="duotone" />
          </span>
          <div>
            <p className="font-bold text-pt">Share recordings with portal students only</p>
            <ol className="mt-2 text-sm text-pt-muted space-y-1.5 list-decimal list-inside">
              {DRIVE_SHARE_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-pt bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Users size={20} weight="duotone" className="text-primary" />
              <h2 className="font-bold text-pt">Portal students ({students.length})</h2>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="text-sm text-pt-muted">No active students in your course yet.</p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto space-y-2">
              {students.map((student) => (
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
            <h2 className="font-bold text-pt">Emails for Google Drive</h2>
          </div>
          <p className="text-xs text-pt-muted mb-3">
            Comma-separated — ready to paste in Drive share dialog. Click the box to select all.
          </p>
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
            <Button size="sm" onClick={copyEmails} disabled={!emailBlob} className="gap-1.5">
              <Copy size={14} />
              Copy for Drive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
