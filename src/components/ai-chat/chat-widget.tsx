"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Trash2,
  RefreshCw,
  Bot,
  User,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  "Course details & syllabus",
  "How do I access my recordings?",
  "Help with JavaScript",
  "How to submit assignments?",
];

export function AIChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of message list
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      // Focus textarea when opened on desktop
      if (window.innerWidth > 640) {
        textareaRef.current?.focus();
      }
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading, scrollToBottom]);

  // Handle message sending
  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend ?? input).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInput("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build history payload for server (max 8 messages)
      const historyPayload = newMessages
        .slice(0, -1)
        .slice(-8)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to get a response from AI.");
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(errText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  // Adjust bottom spacing on student mobile pages so it doesn't overlap the student bottom nav
  const isStudentPortal = pathname?.startsWith("/student");

  return (
    <aside aria-label="EEST AI Assistant" className="print:hidden">
      {/* Floating Launcher Button */}
      <div
        className={cn(
          "fixed z-40 transition-all duration-300",
          isStudentPortal
            ? "bottom-24 right-4 sm:bottom-6 sm:right-6"
            : "bottom-6 right-4 sm:bottom-6 sm:right-6",
          isOpen ? "scale-0 pointer-events-none" : "scale-100"
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "group relative flex items-center gap-2.5 px-4 py-3 sm:px-4.5 sm:py-3.5",
            "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500",
            "hover:from-orange-500 hover:to-amber-500",
            "text-white font-semibold text-sm rounded-full shadow-lg shadow-orange-500/30",
            "transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-500/20"
          )}
          aria-label="Open EEST AI Assistant"
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-orange-500/30 animate-pulse -z-10" />

          <div className="relative">
            <Bot className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-1 ring-white" />
            </span>
          </div>
          <span className="hidden sm:inline-block tracking-tight font-medium">
            AI Assistant
          </span>
          <Sparkles className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>

      {/* Expandable Chat Drawer Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-chat-title"
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden",
            "bg-card text-card-foreground border border-border shadow-2xl rounded-2xl",
            "transition-all duration-300 ease-out animate-in fade-in zoom-in-95",
            // Always anchored strictly to the bottom-right corner
            "right-4 sm:right-6",
            isStudentPortal ? "bottom-24 sm:bottom-6" : "bottom-4 sm:bottom-6",
            // Responsive width: max 410px, adapts on smaller viewports
            "w-[calc(100vw-2rem)] max-w-[410px]",
            // Height: 580px or safe viewport height
            "h-[580px] max-h-[calc(100dvh-5rem)]"
          )}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    id="ai-chat-title"
                    className="font-bold text-sm text-foreground truncate"
                  >
                    EEST AI Assistant
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  Official Academy & Coding Mentor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-muted/20 scrollbar-thin">
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="my-auto py-6 px-2 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 text-primary flex items-center justify-center border border-orange-500/20 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground">
                    As-salamu alaykum! 👋
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    I am your EEST AI assistant. Ask questions about courses, schedules, portal features, or programming topics in{" "}
                    <strong className="text-foreground">English</strong> or{" "}
                    <strong className="text-foreground">Roman Urdu</strong>.
                  </p>
                </div>

                {/* Quick starter prompt chips */}
                <div className="pt-2 text-left space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Suggested topics
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="w-full text-left text-xs px-3 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted/60 text-card-foreground transition-all duration-150 flex items-center justify-between group cursor-pointer shadow-2xs"
                      >
                        <span className="truncate">{prompt}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs text-sm",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-xs"
                      : "bg-card border border-border/80 text-card-foreground rounded-bl-xs"
                  )}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed select-text">
                      {msg.content}
                    </p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                  <span
                    className={cn(
                      "block text-[10px] mt-1 text-right select-none",
                      msg.role === "user" ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-muted border border-border text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-start justify-start">
                <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/20 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl rounded-bl-xs px-4 py-3 bg-card border border-border/80 text-muted-foreground text-xs shadow-2xs flex items-center gap-2">
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </span>
                  <span className="text-[11px] font-medium text-foreground">
                    EEST AI is thinking...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {errorMessage && (
              <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-relaxed">{errorMessage}</p>
                  {messages.length > 0 && messages[messages.length - 1].role === "user" && (
                    <button
                      type="button"
                      onClick={() => handleSend(messages[messages.length - 1].content)}
                      className="inline-flex items-center gap-1 font-semibold text-[11px] underline hover:no-underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry request
                    </button>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="shrink-0 p-3 bg-card border-t border-border/80 space-y-2">
            <div className="relative flex items-end gap-2 bg-muted/40 rounded-xl p-1.5 border border-border focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask in English or Roman Urdu... (Enter to send)"
                maxLength={1000}
                rows={2}
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none p-1.5 max-h-24 scrollbar-thin"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2 rounded-lg shrink-0 transition-all cursor-pointer",
                  input.trim() && !isLoading
                    ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                    : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                )}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>Shift+Enter for newline</span>
              <span>{input.length}/1000</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
