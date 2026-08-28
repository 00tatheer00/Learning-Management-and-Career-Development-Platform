import type { Metadata } from "next";
import { AdminSupportPanel } from "@/components/admin/admin-support-panel";

export const metadata: Metadata = {
  title: "Support Tickets — Admin",
  robots: { index: false, follow: false },
};

export default function AdminSupportPage() {
  return <AdminSupportPanel />;
}
