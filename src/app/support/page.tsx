import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { PublicSupportContent } from "@/components/sections/public-support-content";

export const metadata: Metadata = {
  title: `Support — ${SITE_CONFIG.name}`,
  description: "Need help? Submit a support ticket and track your issue. Our team responds within 48 hours.",
};

export default function PublicSupportPage() {
  return <PublicSupportContent />;
}
