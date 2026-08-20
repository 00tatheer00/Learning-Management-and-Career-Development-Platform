"use client";

import { useState } from "react";
import { Send, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/ui/toast";

export function AdminBatchBroadcastPanel() {
  const [program, setProgram] = useState("web-development");
  const [batch, setBatch] = useState("Batch 1");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both a title and message.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "email",
          programSlug: program,
          batch,
          title,
          message,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send broadcast");
      }

      toast.success("Broadcast email dispatched successfully!");
      setTitle("");
      setMessage("");
    } catch {
      toast.error("Could not dispatch broadcast. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Send size={18} className="text-primary" />
          Batch Email Announcement
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Dispatch instant updates, class schedules, and reminders directly to student registered email inboxes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold">Program</Label>
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="w-full mt-1.5 h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium focus:outline-hidden"
          >
            <option value="web-development">Web Development</option>
            <option value="app-development">App Development</option>
            <option value="artificial-intelligence">Artificial Intelligence</option>
            <option value="all">All Programs</option>
          </select>
        </div>

        <div>
          <Label className="text-xs font-semibold">Target Batch</Label>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="w-full mt-1.5 h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium focus:outline-hidden"
          >
            <option value="Batch 1">Batch 1</option>
            <option value="Batch 2">Batch 2</option>
            <option value="all">All Active Batches</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs font-semibold">Announcement Title / Subject</Label>
          <Input
            placeholder="e.g. Live Class Today at 8:00 PM — Join Link Included"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-9 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold">Message Body</Label>
          <textarea
            rows={3}
            placeholder="Type announcement message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full mt-1 rounded-lg border border-border bg-background p-3 text-xs focus:outline-hidden resize-none font-medium"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-muted flex items-center gap-1">
          <AlertCircle size={12} className="text-amber-500" />
          Messages are dispatched to all verified students in the target batch.
        </p>

        <Button
          onClick={handleSendBroadcast}
          disabled={sending || !title.trim() || !message.trim()}
          size="sm"
          className="gap-2 text-xs font-bold"
        >
          <Mail size={14} />
          {sending ? "Sending Email..." : "Send Announcement"}
        </Button>
      </div>
    </div>
  );
}
