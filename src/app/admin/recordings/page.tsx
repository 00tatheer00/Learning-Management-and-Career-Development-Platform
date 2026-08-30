import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassRecordings } from "@/lib/api/class-recordings";
import { StudentRecordingsContent } from "@/components/portal/student-recordings-content";
import { programs } from "@/lib/data/programs";

export const metadata: Metadata = {
  title: "Class Recordings | Admin Portal",
  description: "View all published class recordings across courses.",
};

export default async function AdminRecordingsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "admin_readonly")) {
    redirect("/login");
  }

  const allRecordings = await getClassRecordings("web-development");
  const programModules =
    programs.find((p) => p.slug === "web-development")?.modules.map((m) => m.name) ?? [];

  return (
    <div className="space-y-6 pb-16">
      <StudentRecordingsContent
        programSlug="web-development"
        recordings={allRecordings}
        adminView={true}
        modules={programModules}
      />
    </div>
  );
}
