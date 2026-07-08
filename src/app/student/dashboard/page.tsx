import Link from "next/link";
import {
  BookOpen,
  ClipboardText,
  ChatsCircle,
  ChalkboardTeacher,
  FilmStrip,
} from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignments, getLiveSessionsPreview, getMaterials } from "@/lib/api/portal-data";
import {
  PortalSectionTitle,
  PortalSurfaceCard,
  StatCard,
  QuickActionCard,
} from "@/components/portal/portal-ui";
import { StudentTrainerCard } from "@/components/portal/student-trainer-card";
import { StudentWhatsAppGroupCard } from "@/components/portal/student-whatsapp-group-card";
import { StudentNextClassCard } from "@/components/portal/student-next-class-card";
import { StudentModuleRoadmap } from "@/components/portal/student-module-roadmap";
import { StudentClassProgressCard } from "@/components/portal/student-class-progress-card";
import { StudentAttendanceProgressCard } from "@/components/portal/student-attendance";
import { StudentDashboardHero } from "@/components/portal/student-dashboard-hero";
import { HELP_CONFIG } from "@/lib/constants/help";
import { ModuleStartsSoonNotice } from "@/components/portal/module-starts-soon-notice";
import { findNextUpcomingSession } from "@/lib/utils/session-datetime";
import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";
import {
  getStudentModuleEnrollmentViews,
  studentHasLiveClassAccess,
} from "@/lib/api/student-module-enrollments";
import { VideoCamera, GraduationCap } from "@phosphor-icons/react/ssr";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const [materials, assignments, sessions] = await Promise.all([
    getMaterials(programSlug),
    getAssignments(programSlug),
    getLiveSessionsPreview(programSlug),
  ]);
  const enrolledModules = user.email
    ? await getApprovedEnrollmentLevels(user.email, programSlug)
    : [];
  const moduleEnrollments = user.email
    ? await getStudentModuleEnrollmentViews(user.email, programSlug)
    : [];
  const nextSession = findNextUpcomingSession(sessions, programSlug);
  const canJoinLive = studentHasLiveClassAccess(programSlug, moduleEnrollments);

  return (
    <div className="space-y-6">
      <StudentDashboardHero
        name={user.name}
        programSlug={programSlug}
        moduleName={user.level}
        canJoinLive={canJoinLive}
        materialsCount={materials.length}
        assignmentsCount={assignments.length}
      />

      {!canJoinLive && (
        <ModuleStartsSoonNotice
          programSlug={programSlug}
          studentModule={user.level}
          compact
        />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          {nextSession ? (
            <StudentNextClassCard
              session={nextSession}
              canJoinLive={canJoinLive}
              programSlug={programSlug}
              studentModule={user.level}
            />
          ) : (
            <PortalSurfaceCard className="p-5 border-dashed">
              <p className="font-semibold text-pt">No upcoming class scheduled yet</p>
              <p className="text-sm text-pt-muted mt-1">
                Your trainer will add the next session. Check{" "}
                <Link href="/student/classes" className="text-primary font-semibold hover:underline">
                  Live Classes
                </Link>{" "}
                for updates.
              </p>
            </PortalSurfaceCard>
          )}

          {canJoinLive && (
            <div className="grid gap-5 sm:grid-cols-2">
              <StudentAttendanceProgressCard
                programSlug={programSlug}
                studentId={user.id}
                studentLevel={user.level}
              />
              <StudentClassProgressCard programSlug={programSlug} />
            </div>
          )}

          <StudentModuleRoadmap
            programSlug={programSlug}
            currentModule={user.level}
            enrolledModules={enrolledModules}
          />
        </div>

        <div className="lg:col-span-4 space-y-5">
          <StudentWhatsAppGroupCard variant="banner" />
          <StudentTrainerCard programSlug={programSlug} trainerId={user.trainerId} />

          <div className="grid grid-cols-2 gap-2">
            <StatCard
              compact
              label="Lessons"
              value={materials.length}
              accent="orange"
              href="/student/course"
            />
            <StatCard
              compact
              label="Tasks"
              value={assignments.length}
              accent="blue"
              href="/student/assignments"
            />
            <StatCard
              compact
              label="Classes"
              value={sessions.length}
              accent="green"
              href="/student/classes"
            />
            <StatCard
              compact
              label="Modules"
              value={enrolledModules.length || user.level || "—"}
              accent="slate"
            />
          </div>

          {moduleEnrollments.length > 1 && (
            <PortalSurfaceCard href="/student/profile" className="p-4">
              <p className="text-sm font-semibold text-pt">Multiple module logins</p>
              <p className="text-xs text-pt-muted mt-1">
                You have {moduleEnrollments.length} approved modules. View passwords on your profile.
              </p>
            </PortalSurfaceCard>
          )}
        </div>
      </div>

      <div>
        <PortalSectionTitle title="Explore your portal" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <QuickActionCard
            href="/student/course"
            title="Watch Lessons"
            description="Course videos & materials"
            icon={<BookOpen size={20} weight="duotone" />}
            gradient="from-stone-700 to-stone-800"
          />
          <QuickActionCard
            href="/student/assignments"
            title="Submit Homework"
            description="View & submit assignments"
            icon={<ClipboardText size={20} weight="duotone" />}
            gradient="from-stone-600 to-stone-700"
          />
          <QuickActionCard
            href="/student/classes"
            title="Live Classes"
            description="Join scheduled sessions"
            icon={<VideoCamera size={20} weight="duotone" />}
            gradient="from-[#5a6b62] to-[#3d4a44]"
          />
          <QuickActionCard
            href="/student/recordings"
            title="Class Recordings"
            description="Rewatch past classes"
            icon={<FilmStrip size={20} weight="duotone" />}
            gradient="from-[#8a6b55] to-[#6b513f]"
          />
          <QuickActionCard
            href="/student/trainer"
            title="My Trainer"
            description="Meet your instructor"
            icon={<ChalkboardTeacher size={20} weight="duotone" />}
            gradient="from-slate-700 to-slate-800"
          />
          <QuickActionCard
            href="/student/profile"
            title="My Profile"
            description="Account & module logins"
            icon={<GraduationCap size={20} weight="duotone" />}
            gradient="from-zinc-700 to-zinc-800"
          />
          <QuickActionCard
            href="/student/whatsapp"
            title="WhatsApp Group"
            description="Join the class chat"
            icon={<ChatsCircle size={20} weight="duotone" />}
            gradient="from-[#4a6b58] to-[#365243]"
          />
          <QuickActionCard
            href={HELP_CONFIG.whatsappUrl}
            title="Need Help?"
            description="Message support anytime"
            icon={<ChatsCircle size={20} weight="fill" />}
            gradient="from-[#3d5c48] to-[#2d4638]"
          />
        </div>
      </div>
    </div>
  );
}
