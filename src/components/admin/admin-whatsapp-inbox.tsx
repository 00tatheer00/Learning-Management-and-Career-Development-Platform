"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowLeft,
  ChatsCircle,
  MagnifyingGlass,
  PaperPlaneTilt,
  PencilSimpleLine,
  UserCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PortalPageHeader } from "@/components/portal/portal-ui";
import { cn, formatAppliedDateTime } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import { useAdminPermissions } from "@/components/admin/admin-permissions";
import { useAdminWhatsAppInbox } from "@/components/admin/admin-whatsapp-inbox-provider";
import { WhatsAppMessageTicks } from "@/components/admin/whatsapp-message-ticks";
import { formatWhatsAppDeliveryError } from "@/lib/whatsapp/messaging-window";
import type { WhatsAppConversationRow, WhatsAppMessageRow } from "@/lib/api/whatsapp-crm";

type StatusFilter = "open" | "archived" | "all";

const THREAD_POLL_MS = 3_000;

function contactLabel(contact: WhatsAppConversationRow["contact"]) {
  return contact.displayName ?? contact.profileName ?? contact.phoneE164;
}

export function AdminWhatsAppInbox() {
  const { canWrite } = useAdminPermissions();
  const { conversations, refreshConversations } = useAdminWhatsAppInbox();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessageRow[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newChatSending, setNewChatSending] = useState(false);
  const [newChatUseTemplate, setNewChatUseTemplate] = useState(true);
  const [canSendFreeText, setCanSendFreeText] = useState(true);
  const [sendingTemplate, setSendingTemplate] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!q) return true;
      const label = contactLabel(item.contact).toLowerCase();
      return (
        label.includes(q) ||
        item.contact.phoneE164.includes(q) ||
        (item.lastMessagePreview?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [conversations, search, statusFilter]);

  const selected = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const loadThread = useCallback(async (conversationId: string, silent = false) => {
    if (!silent) setLoadingThread(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations/${conversationId}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!json.success) {
        if (!silent) toast.error("Could not load conversation", json.error ?? json.message);
        return;
      }
      setMessages(json.data?.messages ?? []);
      setCanSendFreeText(json.data?.messagingWindow?.canSendFreeText ?? false);
      void refreshConversations();
    } catch {
      if (!silent) toast.error("Could not load conversation");
    } finally {
      if (!silent) setLoadingThread(false);
    }
  }, [refreshConversations]);

  useEffect(() => {
    if (!selectedId) return;
    void loadThread(selectedId);
  }, [selectedId, loadThread]);

  useEffect(() => {
    if (!selectedId) return;
    const interval = window.setInterval(() => {
      void loadThread(selectedId, true);
    }, THREAD_POLL_MS);
    return () => window.clearInterval(interval);
  }, [selectedId, loadThread]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingThread]);

  const sendReply = async () => {
    if (!selectedId || !reply.trim() || !canWrite) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", body: reply.trim() }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error("Send failed", json.error ?? json.message);
        return;
      }
      setReply("");
      await loadThread(selectedId, true);
      void refreshConversations();
    } catch {
      toast.error("Send failed");
    } finally {
      setSending(false);
    }
  };

  const sendTemplate = async () => {
    if (!selectedId || !canWrite) return;
    setSendingTemplate(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "template", templateName: "hello_world" }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error("Template failed", json.error ?? json.message);
        return;
      }
      toast.success("Template sent — jab wo reply karein, free text chalega 24h tak");
      await loadThread(selectedId, true);
      void refreshConversations();
    } catch {
      toast.error("Template failed");
    } finally {
      setSendingTemplate(false);
    }
  };

  const startNewChat = async () => {
    if (!canWrite || !newPhone.trim()) return;
    if (!newChatUseTemplate && !newMessage.trim()) return;
    setNewChatSending(true);
    try {
      const res = await fetch("/api/admin/whatsapp/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: newPhone.trim(),
          body: newChatUseTemplate ? undefined : newMessage.trim(),
          name: newName.trim() || undefined,
          sendTemplate: newChatUseTemplate,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error("Could not send", json.error ?? json.message);
        return;
      }
      toast.success("Message sent");
      setNewChatOpen(false);
      setNewPhone("");
      setNewName("");
      setNewMessage("");
      const conversationId = json.data?.conversation?.id as string | undefined;
      if (conversationId) {
        setSelectedId(conversationId);
        setMobileShowThread(true);
        await loadThread(conversationId);
      }
      void refreshConversations();
    } catch {
      toast.error("Could not send");
    } finally {
      setNewChatSending(false);
    }
  };

  const archiveConversation = async () => {
    if (!selectedId || !canWrite) return;
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error("Could not archive", json.error ?? json.message);
        return;
      }
      toast.success("Conversation archived");
      setSelectedId(null);
      setMobileShowThread(false);
      void refreshConversations();
    } catch {
      toast.error("Could not archive");
    }
  };

  return (
    <div>
      <PortalPageHeader
        title="WhatsApp Inbox"
        description="Chat with anyone on your business number. Incoming replies appear here in real time."
      >
        {canWrite && (
          <Button type="button" className="gap-2" onClick={() => setNewChatOpen(true)}>
            <PencilSimpleLine size={18} weight="bold" />
            New message
          </Button>
        )}
      </PortalPageHeader>

      <div className="rounded-2xl border border-border bg-background overflow-hidden min-h-[70vh] flex flex-col lg:flex-row">
        <aside
          className={cn(
            "border-b lg:border-b-0 lg:border-r border-border flex flex-col",
            "w-full lg:w-[340px] shrink-0",
            mobileShowThread && "hidden lg:flex"
          )}
        >
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or number..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-1">
              {(["open", "archived", "all"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium capitalize",
                    statusFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-6 text-sm text-muted text-center">
                No chats yet. Tap <strong>New message</strong> to text someone, or wait for them to
                message your business number.
              </p>
            ) : (
              filtered.map((item) => {
                const active = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      setMobileShowThread(true);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-3 border-b border-border/60 hover:bg-surface/80",
                      active && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                        <UserCircle size={22} weight="duotone" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm truncate">
                            {contactLabel(item.contact)}
                          </p>
                          {item.unreadCount > 0 && (
                            <span className="shrink-0 rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted truncate">{item.contact.phoneE164}</p>
                        <p className="text-xs text-muted truncate mt-0.5">
                          {item.lastMessagePreview ?? "No messages"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={cn(
            "flex-1 flex flex-col min-h-[50vh]",
            !mobileShowThread && "hidden lg:flex"
          )}
        >
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted">
              <ChatsCircle size={48} weight="duotone" className="text-emerald-600 mb-3" />
              <p className="font-medium text-foreground">Select a chat or start a new one</p>
              <p className="text-sm mt-1 max-w-sm">
                Use <strong>New message</strong> to text any number. When they reply on WhatsApp,
                the chat updates here automatically.
              </p>
              {canWrite && (
                <Button type="button" className="mt-4 gap-2" onClick={() => setNewChatOpen(true)}>
                  <PencilSimpleLine size={18} weight="bold" />
                  New message
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileShowThread(false)}
                >
                  <ArrowLeft size={18} />
                </Button>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{contactLabel(selected.contact)}</p>
                  <p className="text-xs text-muted">{selected.contact.phoneE164}</p>
                </div>
                {canWrite && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => void archiveConversation()}
                  >
                    <Archive size={16} />
                    Archive
                  </Button>
                )}
              </div>

              {!canSendFreeText && (
                <div className="mx-4 mt-3 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-xs text-amber-950">
                  <strong>Meta 24-hour rule:</strong> is number ne recently aapko message nahi kiya —
                  free text deliver nahi hoga (red ! wala error).{" "}
                  <strong>Send template</strong> use karo, ya unse{" "}
                  <strong>+92 321 5919502</strong> par pehle message karwao — phir 24h reply freely.
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/40">
                {loadingThread ? (
                  <p className="text-sm text-muted text-center py-8">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted text-center py-8">No messages in this thread.</p>
                ) : (
                  messages.map((msg) => {
                    const outbound = msg.direction === "outbound";
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex", outbound ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                            outbound
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-background border border-border rounded-bl-md"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                          <div
                            className={cn(
                              "flex items-center justify-end gap-1 text-[10px] mt-1",
                              outbound ? "text-primary-foreground/70" : "text-muted"
                            )}
                          >
                            <span>
                              {formatAppliedDateTime(msg.createdAt)}
                              {outbound && msg.sentByAgentName ? ` · ${msg.sentByAgentName}` : ""}
                            </span>
                            {outbound && (
                              <WhatsAppMessageTicks
                                status={msg.status}
                                readAt={msg.readAt}
                                deliveredAt={msg.deliveredAt}
                              />
                            )}
                          </div>
                          {outbound && msg.status === "failed" && msg.statusError && (
                            <p className="text-[10px] text-red-200 mt-1 font-medium">
                              {formatWhatsAppDeliveryError(msg.statusError)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={threadEndRef} />
              </div>

              {canWrite ? (
                <div className="p-3 border-t border-border space-y-2">
                  {!canSendFreeText && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full gap-2"
                      disabled={sendingTemplate}
                      onClick={() => void sendTemplate()}
                    >
                      {sendingTemplate ? "Sending template..." : "Send template (Hello World)"}
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={
                        canSendFreeText
                          ? "Type a message..."
                          : "Free text blocked — use template above first"
                      }
                      disabled={!canSendFreeText}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void sendReply();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      disabled={sending || !reply.trim() || !canSendFreeText}
                      onClick={() => void sendReply()}
                      className="gap-1.5 shrink-0"
                    >
                      <PaperPlaneTilt size={18} weight="fill" />
                      {sending ? "..." : "Send"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="p-3 text-xs text-muted border-t border-border">
                  Read-only — you can view messages but not reply.
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <Modal open={newChatOpen} onClose={() => setNewChatOpen(false)} title="New WhatsApp message">
        <div className="space-y-3">
          <p className="text-sm text-muted">
            <strong>Naye number par pehli message?</strong> Meta free text allow nahi karta —{" "}
            <strong>Template message</strong> use karo (Hello World). Jab wo reply kare, 24 hours
            tak normal chat kar sakte ho.
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newChatUseTemplate}
              onChange={(e) => setNewChatUseTemplate(e.target.checked)}
            />
            Send as Meta template (recommended for new numbers)
          </label>
          <Input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Phone — 03XXXXXXXXX"
          />
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name (optional)"
          />
          {!newChatUseTemplate && (
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Your message..."
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setNewChatOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={newChatSending || !newPhone.trim() || (!newChatUseTemplate && !newMessage.trim())}
              onClick={() => void startNewChat()}
              className="gap-2"
            >
              <PaperPlaneTilt size={18} weight="fill" />
              {newChatSending ? "Sending..." : newChatUseTemplate ? "Send template" : "Send"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
