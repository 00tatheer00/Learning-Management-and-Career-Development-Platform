"use client";

import { useState, useRef, type DragEvent } from "react";
import Image from "next/image";
import { UploadCloud, FileImage, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnrollmentDropzoneProps {
  file: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export function EnrollmentDropzone({
  file,
  previewUrl,
  onFileSelect,
  error,
}: EnrollmentDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onFileSelect(selected);
        }}
      />

      {file && previewUrl ? (
        <div className="relative rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-emerald-500/30 bg-background shadow-xs">
            <Image
              src={previewUrl}
              alt="Payment screenshot preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 size={16} />
              <span>Screenshot Uploaded</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-foreground truncate">{file.name}</p>
            <p className="text-[11px] text-muted font-medium">
              {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type || "Image"}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onFileSelect(null)}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-500/10 gap-1 shrink-0"
          >
            <X size={14} /> Remove
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : error
              ? "border-red-500/50 bg-red-500/5"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <UploadCloud size={24} />
          </div>

          <p className="text-sm font-bold text-foreground">
            Drag &amp; Drop Payment Screenshot or{" "}
            <span className="text-primary hover:underline">Browse</span>
          </p>

          <p className="mt-1 text-xs text-muted font-medium">
            Upload Easypaisa transaction receipt (JPG or PNG, max 4MB)
          </p>

          {error && (
            <p className="mt-2 text-xs font-bold text-red-600 flex items-center justify-center gap-1">
              <AlertTriangle size={12} />
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
