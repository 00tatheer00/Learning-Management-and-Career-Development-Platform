import type { Metadata } from "next";
import { StudentSupportPanel } from "@/components/portal/student-support-panel";

export const metadata: Metadata = {
  title: "Support — Student Portal",
  robots: { index: false, follow: false },
};

export default function StudentSupportPage() {
  return <StudentSupportPanel />;
}
