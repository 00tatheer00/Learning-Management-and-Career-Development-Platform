"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Split content by code blocks first
  const parts = splitByCodeBlocks(content);

  return (
    <div className="space-y-2 text-sm leading-relaxed break-words [overflow-wrap:anywhere] max-w-full">
      {parts.map((part, idx) => {
        if (part.type === "code") {
          return (
            <CodeBlock
              key={idx}
              language={part.language}
              code={part.content}
            />
          );
        }

        return <TextMarkdown key={idx} text={part.content} />;
      })}
    </div>
  );
}

function CodeBlock({ language, code }: { language?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-border bg-[#0d1117] text-slate-100 shadow-sm text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-white/10 text-slate-400 select-none">
        <span className="text-[11px] font-medium uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-white/10"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto scrollbar-thin">
        <pre className="m-0 leading-normal">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function TextMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Headings
        if (line.startsWith("### ")) {
          return (
            <h4
              key={lineIdx}
              className="font-semibold text-sm mt-3 mb-1 text-foreground"
            >
              {renderFormattedInline(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3
              key={lineIdx}
              className="font-bold text-base mt-3.5 mb-1 text-foreground"
            >
              {renderFormattedInline(line.slice(3))}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2
              key={lineIdx}
              className="font-bold text-lg mt-4 mb-1 text-foreground"
            >
              {renderFormattedInline(line.slice(2))}
            </h2>
          );
        }

        // Bullet lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 my-0.5 pl-1">
              <span className="text-primary font-bold select-none leading-relaxed">•</span>
              <span className="flex-1">
                {renderFormattedInline(trimmed.slice(2))}
              </span>
            </div>
          );
        }

        // Numbered lists (e.g. "1. ")
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 my-0.5 pl-1">
              <span className="text-primary font-semibold text-xs select-none min-w-[1.2rem]">
                {numberedMatch[1]}.
              </span>
              <span className="flex-1">
                {renderFormattedInline(numberedMatch[2])}
              </span>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={lineIdx} className="my-0.5">
            {renderFormattedInline(line)}
          </p>
        );
      })}
    </>
  );
}

/**
 * Parses inline formatting: bold (**text**), code (`code`), markdown links ([text](url)), and raw URLs
 */
function renderFormattedInline(text: string): React.ReactNode {
  // Regex to split by bold, inline code, markdown links, and raw URLs
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<)\]]+)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    // Bold text (**text**)
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2).trim();
      // If the bold text is actually a URL, render it as a bold clickable link
      if (inner.startsWith("http://") || inner.startsWith("https://")) {
        return (
          <a
            key={i}
            href={inner}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-2 break-all hover:text-primary/80 transition-colors"
          >
            {inner}
          </a>
        );
      }
      return (
        <strong key={i} className="font-semibold text-foreground">
          {inner}
        </strong>
      );
    }

    // Inline code (`code`)
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-muted text-primary font-mono text-[12px] font-medium border border-border/50 break-all"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Markdown link: [Title](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const href = linkMatch[2];
      const isInternal = href.startsWith("/");
      return (
        <a
          key={i}
          href={href}
          target={isInternal ? "_self" : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          className="text-primary hover:underline font-medium inline-flex items-center gap-0.5 break-all underline-offset-2"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Raw URL: https://...
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium break-all underline-offset-2"
        >
          {part}
        </a>
      );
    }

    return part;
  });
}

function splitByCodeBlocks(
  text: string
): Array<{ type: "text" | "code"; content: string; language?: string }> {
  const result: Array<{ type: "text" | "code"; content: string; language?: string }> = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    result.push({
      type: "code",
      language: match[1]?.trim() || "code",
      content: match[2]?.replace(/\n$/, "") || "",
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return result;
}
