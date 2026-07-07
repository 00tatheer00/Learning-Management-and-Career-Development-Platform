/** Guidance for trainers sharing class recordings on Google Drive. */

export const DRIVE_SHARE_STEPS = [
  "Upload the class video to your school Google Drive (Workspace account).",
  "Share → Add people → paste one batch of emails (about 40) → Viewer.",
  "Click Send, then paste the next batch until all module emails are added.",
  "Turn ON: “Disable download, print, and copy” (Workspace share settings).",
  "Do NOT use “Anyone with the link” for lecture videos.",
  "Add the same Drive link in Class Recordings on the portal.",
] as const;

export const DRIVE_DOWNLOAD_NOTE =
  "On Google Workspace you can block the Download button for viewers. Personal Gmail has weaker controls — use the school Workspace account for recordings.";

export const DRIVE_DOWNLOAD_LIMITATION =
  "This stops casual downloading from Drive. It cannot stop screen recording or every technical workaround — but it is the standard way schools protect lecture videos.";
