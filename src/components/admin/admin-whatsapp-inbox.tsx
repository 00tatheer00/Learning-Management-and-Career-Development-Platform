"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowLeft,
  ChatsCircle,
  MagnifyingGlass,
  PaperPlaneTilt,
  PencilSimpleLine,
  Plus,
  CircleNotch,
  UserCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/ui/toast";
import { useAdminPermissions } from "@/components/admin/admin-permissions";
import { useAdminWhatsAppInbox } from "@/components/admin/admin-whatsapp-inbox-provider";
import {
  WhatsAppMessageBubble,
  type DisplayMessage,
} from "@/components/admin/whatsapp-inbox/message-bubble";
import {
  avatarColor,
  formatWaListTime,
  getInitials,
  groupMessagesByDay,
} from "@/components/admin/whatsapp-inbox/utils";
import type { WhatsAppConversationRow, WhatsAppMessageRow } from "@/lib/api/whatsapp-crm";

type StatusFilter = "open" | "archived" | "all";

const THREAD_POLL_MS = 3_000;

function contactLabel(contact: WhatsAppConversationRow["contact"]) {
  return contact.displayName ?? contact.profileName ?? contact.phoneE164;
}

function WaAvatar({ name, seed, size = "md" }: { name: string; seed: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-10 w-10 text-sm" : size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        avatarColor(seed),
        dim
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export function AdminWhatsAppInbox() {
  const { canWrite } = useAdminPermissions();
  const { conversations, refreshConversations, totalUnread, setActiveConversationId } =
    useAdminWhatsAppInbox();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessageRow[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<DisplayMessage[]>([]);
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
  const replyRef = useRef<HTMLTextAreaElement | null>(null);

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

  const displayMessages = useMemo(() => {
    const merged: DisplayMessage[] = [...messages, ...optimisticMessages];
    return merged.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, optimisticMessages]);

  const messageGroups = useMemo(() => groupMessagesByDay(displayMessages), [displayMessages]);

  const loadThread = useCallback(async (conversationId: string, silent = false) => {
    if (!silent) setLoadingThread(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/conversations/${conversationId}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!json.success) {
        if (!silent) toast.error("Chat load nahi hui", json.error ?? json.message);
        return;
      }
      setMessages(json.data?.messages ?? []);
      setOptimisticMessages([]);
      setCanSendFreeText(json.data?.messagingWindow?.canSendFreeText ?? false);
      void refreshConversations();
    } catch {
      if (!silent) toast.error("Chat load nahi hui", "Internet ya server check karein");
    } finally {
      if (!silent) setLoadingThread(false);
    }
  }, [refreshConversations]);

  useEffect(() => {
    setActiveConversationId(selectedId);
    return () => setActiveConversationId(null);
  }, [selectedId, setActiveConversationId]);

  useEffect(() => {
    if (!selectedId) return;
    void loadThread(selectedId);
  }, [selectedId, loadThread]);

  useEffect(() => {
    if (!selectedId) return;
    const interval = window.setInterval(() => void loadThread(selectedId, true), THREAD_POLL_MS);
    return () => window.clearInterval(interval);
  }, [selectedId, loadThread]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, loadingThread]);

  const sendReply = async () => {
    if (!selectedId || !reply.trim() || !canWrite || !canSendFreeText) return;
    const body = reply.trim();
    const tempId = `opt-${Date.now()}`;
    const optimistic: DisplayMessage = {
      id: tempId,
      direction: "outbound",
      type: "text",
      body,
      status: "pending",
      statusError: null,
      purpose: "agent_reply",
      sentByAgentName: null,
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
      mediaMimeType: null,
      mediaFilename: null,
      optimistic: true,
    };
    setOptimisticMessages((prev) => [...prev, optimistic]);
    setReply("");
    setSending(true);

    try {
      const res = await fetch(`/api/admin/whatsapp/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", body }),
      });
      const json = await res.json();
      if (!json.success) {
        setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
        setReply(body);
        toast.error("Message nahi gaya", json.error ?? json.message);
        return;
      }
      toast.whatsapp("Message bhej diya ✓");
      await loadThread(selectedId, true);
      void refreshConversations();
    } catch {
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
      setReply(body);
      toast.error("Message nahi gaya", "Dobara try karein");
    } finally {
      setSending(false);
      replyRef.current?.focus();
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
        toast.error("Template fail", json.error ?? json.message);
        return;
      }
      toast.whatsapp("Template bhej di ✓", "Jab reply aaye, 24h normal chat chalegi");
      await loadThread(selectedId, true);
      void refreshConversations();
    } catch {
      toast.error("Template fail");
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
        toast.error("Chat start nahi hui", json.error ?? json.message);
        return;
      }
      toast.whatsapp(
        newChatUseTemplate ? "Template bhej di ✓" : "Message bhej diya ✓",
        newChatUseTemplate ? "Reply ka wait karein" : undefined
      );
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
      toast.error("Chat start nahi hui");
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
        toast.error("Archive fail", json.error ?? json.message);
        return;
      }
      toast.info("Chat archived");
      setSelectedId(null);
      setMobileShowThread(false);
      void refreshConversations();
    } catch {
      toast.error("Archive fail");
    }
  };

  return (
    <div className="wa-inbox-shell">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#111b21] flex items-center gap-2">
            <ChatsCircle size={26} weight="duotone" className="text-[#008069]" />
            WhatsApp
            {totalUnread > 0 && (
              <span className="wa-unread-badge rounded-full px-2 flex items-center justify-center font-bold">
                {totalUnread}
              </span>
            )}
          </h1>
          <p className="text-sm text-[#667781] mt-0.5">EE School of Technology · Business inbox</p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setNewChatOpen(true)}
            className="wa-new-chat-btn hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
          >
            <PencilSimpleLine size={18} weight="bold" />
            New chat
          </button>
        )}
      </div>

      <div className="rounded-lg overflow-hidden border border-[#e9edef] shadow-lg min-h-[75vh] max-h-[calc(100vh-140px)] flex flex-col lg:flex-row bg-white">
        {/* ── Chat list ── */}
        <aside
          className={cn(
            "flex flex-col w-full lg:w-[380px] shrink-0 border-[#e9edef] bg-white",
            "lg:border-r",
            mobileShowThread && "hidden lg:flex"
          )}
        >
          <div className="wa-sidebar-header px-3 pt-3 pb-2 space-y-2">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-sm font-semibold text-[#008069]">Chats</span>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => setNewChatOpen(true)}
                  className="sm:hidden wa-new-chat-btn h-9 w-9 rounded-full flex items-center justify-center"
                  aria-label="New chat"
                >
                  <Plus size={20} weight="bold" />
                </button>
              )}
            </div>
            <div className="relative">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696a0]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search or start new chat"
                className="w-full rounded-lg bg-[#f0f2f5] pl-9 pr-3 py-2 text-sm text-[#111b21] placeholder:text-[#8696a0] outline-none focus:ring-1 focus:ring-[#008069]/40"
              />
            </div>
            <div className="flex gap-1 px-0.5">
              {(["open", "archived", "all"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                    statusFilter === filter
                      ? "bg-[#008069] text-white"
                      : "text-[#667781] hover:bg-[#f0f2f5]"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <UserCircle size={48} className="wa-empty-icon mx-auto mb-2" weight="duotone" />
                <p className="text-sm text-[#667781]">No chats yet</p>
                <p className="text-xs text-[#8696a0] mt-1">New chat se message karein</p>
              </div>
            ) : (
              filtered.map((item) => {
                const active = item.id === selectedId;
                const label = contactLabel(item.contact);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      setMobileShowThread(true);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-3 border-b border-[#f0f2f5] wa-list-item transition-colors",
                      active && "wa-list-item-active"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <WaAvatar name={label} seed={item.contact.waId} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-medium text-[15px] text-[#111b21] truncate">{label}</p>
                          <span className="text-[11px] text-[#667781] shrink-0">
                            {formatWaListTime(item.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-[13px] text-[#667781] truncate">
                            {item.lastMessagePreview ?? item.contact.phoneE164}
                          </p>
                          {item.unreadCount > 0 && (
                            <span className="wa-unread-badge rounded-full px-1.5 flex items-center justify-center font-bold shrink-0">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── Thread ── */}
        <section
          className={cn(
            "flex-1 flex flex-col min-h-[420px] bg-[#efeae2]",
            !mobileShowThread && "hidden lg:flex"
          )}
        >
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 wa-chat-wallpaper">
              <div className="bg-white/80 backdrop-blur rounded-2xl px-8 py-10 shadow-sm max-w-sm">
                <ChatsCircle size={56} weight="duotone" className="text-[#008069] mx-auto mb-4" />
                <p className="font-semibold text-[#111b21] text-lg">EEST WhatsApp Web</p>
                <p className="text-sm text-[#667781] mt-2 leading-relaxed">
                  Send and receive messages from your business number. Select a chat or start a new
                  one.
                </p>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => setNewChatOpen(true)}
                    className="wa-new-chat-btn mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
                  >
                    <PencilSimpleLine size={18} weight="bold" />
                    New chat
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="wa-chat-header px-3 py-2.5 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  className="lg:hidden p-2 -ml-1 text-[#008069]"
                  onClick={() => setMobileShowThread(false)}
                  aria-label="Back"
                >
                  <ArrowLeft size={22} weight="bold" />
                </button>
                <WaAvatar name={contactLabel(selected.contact)} seed={selected.contact.waId} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[16px] text-[#111b21] truncate leading-tight">
                    {contactLabel(selected.contact)}
                  </p>
                  <p className="text-xs text-[#667781] truncate">{selected.contact.phoneE164}</p>
                </div>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => void archiveConversation()}
                    className="p-2 rounded-full text-[#54656f] hover:bg-[#f0f2f5]"
                    title="Archive"
                  >
                    <Archive size={20} />
                  </button>
                )}
              </div>

              {!canSendFreeText && (
                <div className="wa-warning-banner mx-3 mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed shrink-0">
                  <strong>24-hour window closed.</strong> Free text blocked —{" "}
                  <button
                    type="button"
                    className="underline font-semibold"
                    onClick={() => void sendTemplate()}
                    disabled={sendingTemplate}
                  >
                    Send template
                  </button>{" "}
                  or ask them to message +92 321 5919502 first.
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-3 space-y-1 wa-chat-wallpaper">
                {loadingThread ? (
                  <div className="flex justify-center py-12">
                    <CircleNotch size={28} className="animate-spin text-[#008069]" />
                  </div>
                ) : displayMessages.length === 0 ? (
                  <p className="text-sm text-[#667781] text-center py-12">
                    No messages yet. Say hello 👋
                  </p>
                ) : (
                  messageGroups.map((group) => (
                    <div key={group.label} className="space-y-1">
                      <div className="flex justify-center my-3 sticky top-1 z-10">
                        <span className="wa-day-pill text-[12.5px] font-medium px-3 py-1 rounded-lg">
                          {group.label}
                        </span>
                      </div>
                      {group.messages.map((msg) => (
                        <WhatsAppMessageBubble key={msg.id} message={msg} />
                      ))}
                    </div>
                  ))
                )}
                <div ref={threadEndRef} />
              </div>

              {canWrite ? (
                <div className="wa-compose-bar px-3 py-2 shrink-0">
                  {!canSendFreeText && (
                    <button
                      type="button"
                      disabled={sendingTemplate}
                      onClick={() => void sendTemplate()}
                      className="w-full mb-2 rounded-lg bg-white border border-[#d1d7db] text-[#008069] text-sm font-medium py-2 hover:bg-[#f5f6f6] disabled:opacity-50"
                    >
                      {sendingTemplate ? "Sending template…" : "📋 Send Hello World template"}
                    </button>
                  )}
                  <div className="flex items-end gap-2">
                    <div className="wa-input-pill flex-1 flex items-end min-h-[42px] px-3 py-2">
                      <textarea
                        ref={replyRef}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder={
                          canSendFreeText ? "Type a message" : "Template required first…"
                        }
                        disabled={!canSendFreeText || sending}
                        rows={1}
                        className="flex-1 resize-none bg-transparent text-[15px] text-[#111b21] placeholder:text-[#8696a0] outline-none max-h-32 leading-5"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void sendReply();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={sending || !reply.trim() || !canSendFreeText}
                      onClick={() => void sendReply()}
                      className="wa-send-btn h-[42px] w-[42px] rounded-full flex items-center justify-center shrink-0 transition-colors"
                      aria-label="Send"
                    >
                      {sending ? (
                        <CircleNotch size={20} className="animate-spin" />
                      ) : (
                        <PaperPlaneTilt size={20} weight="fill" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="p-3 text-xs text-[#667781] bg-[#f0f2f5] text-center shrink-0">
                  Read-only mode
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <Modal open={newChatOpen} onClose={() => setNewChatOpen(false)} title="New chat">
        <div className="space-y-4 wa-modal-accent -mt-2 pt-4">
          <p className="text-sm text-[#667781] leading-relaxed">
            Naye number par pehli message ke liye Meta template use karein. Reply ke baad 24 hours
            normal chat.
          </p>
          <label className="flex items-start gap-3 text-sm text-[#111b21] cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 accent-[#008069]"
              checked={newChatUseTemplate}
              onChange={(e) => setNewChatUseTemplate(e.target.checked)}
            />
            <span>
              <strong>Send template</strong> (Hello World) — recommended for new numbers
            </span>
          </label>
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Phone — 03XXXXXXXXX"
            className="w-full rounded-lg border border-[#e9edef] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#008069]/30"
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Contact name (optional)"
            className="w-full rounded-lg border border-[#e9edef] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#008069]/30"
          />
          {!newChatUseTemplate && (
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Your message…"
              rows={4}
              className="w-full rounded-lg border border-[#e9edef] px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-[#008069]/30"
            />
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setNewChatOpen(false)}>
              Cancel
            </Button>
            <button
              type="button"
              disabled={
                newChatSending || !newPhone.trim() || (!newChatUseTemplate && !newMessage.trim())
              }
              onClick={() => void startNewChat()}
              className="wa-new-chat-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {newChatSending ? (
                <CircleNotch size={18} className="animate-spin" />
              ) : (
                <PaperPlaneTilt size={18} weight="fill" />
              )}
              {newChatSending ? "Sending…" : newChatUseTemplate ? "Send template" : "Send message"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
