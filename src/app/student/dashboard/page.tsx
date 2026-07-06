import Link from "next/link";
import {
  BookOpen,
  ClipboardText,
  ChatsCircle,
  GraduationCap,
  VideoCamera,
  ChalkboardTeacher,
} from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignments, getLiveSessionsPreview, getMaterials } from "@/lib/api/portal-data";
import {
  PortalPageHeader,
  PortalSectionTitle,
  PortalSurfaceCard,
  StatCard,
  QuickActionCard,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { StudentTrainerCard } from "@/components/portal/student-trainer-card";
import { StudentWhatsAppGroupCard } from "@/components/portal/student-whatsapp-group-card";
import { StudentNextClassCard } from "@/components/portal/student-next-class-card";
import { StudentModuleRoadmap } from "@/components/portal/student-module-roadmap";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";
import { HELP_CONFIG } from "@/lib/constants/help";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { getStudentClassSchedule } from "@/lib/constants/student-portal-ur";
import { findNextUpcomingSession } from "@/lib/utils/session-datetime";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const [materials, assignments, sessions] = await Promise.all([
    getMaterials(programSlug),
    getAssignments(programSlug),
    getLiveSessionsPreview(programSlug),
  ]);
  const category = getProgramCategory(programSlug);
  const classSchedule = getStudentClassSchedule(programSlug);
  const nextSession = findNextUpcomingSession(sessions);
  const courseLabel = category?.sidebarLabel ?? "Your course";

  return (
    <div className="space-y-4">
      <PortalPageHeader
        eyebrow="Student Portal"
        title={`Welcome, ${user.name.split(" ")[0]}!`}
        description={`${courseLabel} · classes, lessons & trainer for your program.`}
      >
        <ProgramCategoryBadge programSlug={programSlug} />
        <Button size="sm" asChild className="h-8 text-xs">
          <Link href="/student/classes">Join Live Class</Link>
        </Button>
      </PortalPageHeader>

      <StudentWhatsAppGroupCard variant="banner" />

      {nextSession ? (
        <StudentNextClassCard session={nextSession} />
      ) : (
        <PortalSurfaceCard className="p-4 text-sm text-zinc-500 border-dashed">
          <p className="font-semibold text-foreground">{classSchedule.startDateLabel}</p>
          <p className="mt-1">{classSchedule.daysLabel}</p>
          <p className="mt-2">{classSchedule.subline}</p>
          <p className="mt-2">
            Portal class link will appear on{" "}
            <Link href="/student/classes" className="text-primary font-semibold underline">
              Live Classes
            </Link>{" "}
            when scheduled.
          </p>
        </PortalSurfaceCard>
      )}

      <StudentModuleRoadmap programSlug={programSlug} currentModule={user.level} />

      <StudentTrainerCard programSlug={programSlug} trainerId={user.trainerId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard compact label="Video Lessons" value={materials.length} accent="orange" icon={<BookOpen size={16} weight="duotone" />} href="/student/course" />
        <StatCard compact label="Assignments" value={assignments.length} accent="blue" icon={<ClipboardText size={16} weight="duotone" />} href="/student/assignments" />
        <StatCard compact label="Live Classes" value={sessions.length} accent="green" icon={<VideoCamera size={16} weight="duotone" />} href="/student/classes" />
        <StatCard compact label="Your Module" value={user.level ?? "—"} accent="slate" icon={<GraduationCap size={16} weight="duotone" />} />
      </div>

      <div>
        <PortalSectionTitle title="Quick Access" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickActionCard compact href="/student/course" title="Watch Lessons" description="Course videos & materials" icon={<BookOpen size={18} weight="duotone" />} gradient="from-orange-500 to-amber-500" />
          <QuickActionCard compact href="/student/assignments" title="Submit Homework" description="View & submit assignments" icon={<ClipboardText size={18} weight="duotone" />} gradient="from-blue-500 to-indigo-500" />
          <QuickActionCard compact href="/student/trainer" title="My Trainer" description="Your program trainer" icon={<ChalkboardTeacher size={18} weight="duotone" />} gradient="from-violet-500 to-purple-600" />
          <QuickActionCard compact href="/student/whatsapp" title="WhatsApp Group" description="Join the class group" icon={<ChatsCircle size={18} weight="duotone" />} gradient="from-emerald-500 to-teal-600" />
          <QuickActionCard compact href={HELP_CONFIG.whatsappUrl} title="Need Help?" description="Message us anytime" icon={<ChatsCircle size={18} weight="fill" />} gradient="from-[#25D366] to-[#128C7E]" />
        </div>
      </div>
    </div>
  );
}
