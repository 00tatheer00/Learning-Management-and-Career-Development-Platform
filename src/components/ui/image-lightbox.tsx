"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ArrowSquareOut } from "@phosphor-icons/react";

interface ImageLightboxProps {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  caption?: string;
}

export function ImageLightbox({ open, onClose, src, alt, caption }: ImageLightboxProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/90 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-4 shrink-0">
        <div className="min-w-0 text-white">
          {caption && <p className="font-semibold truncate">{caption}</p>}
          <p className="text-xs text-white/70 mt-0.5">Pinch or scroll to inspect · Esc to close</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
          >
            <ArrowSquareOut size={16} />
            Open full
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X size={22} weight="bold" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 overflow-auto">
        <div className="relative w-full max-w-4xl aspect-[3/4] sm:aspect-auto sm:min-h-[60vh] max-h-[85vh]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            unoptimized
            sizes="(max-width: 768px) 100vw, 900px"
            priority
          />
        </div>
      </div>
    </div>
  );
}
