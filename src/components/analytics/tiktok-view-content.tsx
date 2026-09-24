"use client";

import { useEffect, useRef } from "react";
import { trackTikTokViewContent } from "@/lib/analytics/tiktok";

interface TikTokViewContentProps {
  contentId: string;
  contentName: string;
  value?: number;
  currency?: string;
}

/**
 * Client component to fire TikTok ViewContent on course/program detail pages.
 * Protected against duplicate triggers during React renders or dev StrictMode mounting.
 */
export function TikTokViewContent({
  contentId,
  contentName,
  value = 1000,
  currency = "PKR",
}: TikTokViewContentProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    trackTikTokViewContent({
      contentId,
      contentName,
      value,
      currency,
    });
  }, [contentId, contentName, value, currency]);

  return null;
}
