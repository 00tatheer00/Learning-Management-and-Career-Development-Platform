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
import { getProgramClassSchedule } from "@/lib/constants/course-schedule";
import { findNextUpcomingSession } from "@/lib/utils/session-datetime";
import { STUDENT_UR } from "@/lib/constants/student-portal-ur";

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
  const classSchedule = getProgramClassSchedule(programSlug);
  const nextSession = findNextUpcomingSession(sessions);
  const courseLabel = category?.sidebarLabel ?? "Aapka course";

  return (
    <div className="space-y-4">
      <PortalPageHeader
        eyebrow={STUDENT_UR.dashboard.eyebrow}
        title={STUDENT_UR.welcome(user.name.split(" ")[0])}
        description={STUDENT_UR.dashboard.description(courseLabel)}
      >
        <ProgramCategoryBadge programSlug={programSlug} />
        <Button size="sm" asChild className="h-8 text-xs">
          <Link href="/student/classes">{STUDENT_UR.dashboard.joinLiveClass}</Link>
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
            {STUDENT_UR.dashboard.noClassLink}{" "}
            <Link href="/student/classes" className="text-primary font-semibold underline">
              {STUDENT_UR.dashboard.liveClassesLink}
            </Link>{" "}
            par dikhegi.
          </p>
        </PortalSurfaceCard>
      )}

      <StudentModuleRoadmap programSlug={programSlug} currentModule={user.level} />

      <StudentTrainerCard programSlug={programSlug} trainerId={user.trainerId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard compact label={STUDENT_UR.dashboard.stats.videoLessons} value={materials.length} accent="orange" icon={<BookOpen size={16} weight="duotone" />} href="/student/course" />
        <StatCard compact label={STUDENT_UR.dashboard.stats.assignments} value={assignments.length} accent="blue" icon={<ClipboardText size={16} weight="duotone" />} href="/student/assignments" />
        <StatCard compact label={STUDENT_UR.dashboard.stats.liveClasses} value={sessions.length} accent="green" icon={<VideoCamera size={16} weight="duotone" />} href="/student/classes" />
        <StatCard compact label={STUDENT_UR.dashboard.stats.yourModule} value={user.level ?? STUDENT_UR.profile.empty} accent="slate" icon={<GraduationCap size={16} weight="duotone" />} />
      </div>

      <div>
        <PortalSectionTitle title={STUDENT_UR.dashboard.quickAccess} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickActionCard compact href="/student/course" title={STUDENT_UR.dashboard.watchLessons.title} description={STUDENT_UR.dashboard.watchLessons.desc} icon={<BookOpen size={18} weight="duotone" />} gradient="from-orange-500 to-amber-500" />
          <QuickActionCard compact href="/student/assignments" title={STUDENT_UR.dashboard.submitHomework.title} description={STUDENT_UR.dashboard.submitHomework.desc} icon={<ClipboardText size={18} weight="duotone" />} gradient="from-blue-500 to-indigo-500" />
          <QuickActionCard compact href="/student/trainer" title={STUDENT_UR.dashboard.myTrainer.title} description={STUDENT_UR.dashboard.myTrainer.desc} icon={<ChalkboardTeacher size={18} weight="duotone" />} gradient="from-violet-500 to-purple-600" />
          <QuickActionCard compact href="/student/whatsapp" title={STUDENT_UR.dashboard.whatsappGroup.title} description={STUDENT_UR.dashboard.whatsappGroup.desc} icon={<ChatsCircle size={18} weight="duotone" />} gradient="from-emerald-500 to-teal-600" />
          <QuickActionCard compact href={HELP_CONFIG.whatsappUrl} title={STUDENT_UR.dashboard.needHelp.title} description={STUDENT_UR.dashboard.needHelp.desc} icon={<ChatsCircle size={18} weight="fill" />} gradient="from-[#25D366] to-[#128C7E]" />
        </div>
      </div>
    </div>
  );
}
