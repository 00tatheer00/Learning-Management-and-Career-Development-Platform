import Link from "next/link";
import {
  BookOpen,
  ClipboardText,
  ChatsCircle,
  ChalkboardTeacher,
  FilmStrip,
  VideoCamera,
  GraduationCap,
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
import { StudentDailySpark } from "@/components/portal/student-daily-spark";
import {
  StudentReveal,
  StudentStagger,
  StudentStaggerItem,
} from "@/components/portal/student-motion";
import { HELP_CONFIG } from "@/lib/constants/help";
import { ModuleStartsSoonNotice } from "@/components/portal/module-starts-soon-notice";
import { findNextUpcomingSession } from "@/lib/utils/session-datetime";
import { getApprovedEnrollmentLevels } from "@/lib/auth/student-module-sync";
import {
  getStudentModuleEnrollmentViews,
  studentHasLiveClassAccess,
} from "@/lib/api/student-module-enrollments";

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

      <StudentDailySpark name={user.name} />

      {!canJoinLive && (
        <StudentReveal delay={0.1}>
          <ModuleStartsSoonNotice
            programSlug={programSlug}
            studentModule={user.level}
            compact
          />
        </StudentReveal>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <StudentReveal delay={0.12}>
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
          </StudentReveal>

          {canJoinLive && (
            <StudentStagger className="grid gap-5 sm:grid-cols-2" delay={0.15} stagger={0.09}>
              <StudentStaggerItem>
                <StudentAttendanceProgressCard
                  programSlug={programSlug}
                  studentId={user.id}
                  studentLevel={user.level}
                />
              </StudentStaggerItem>
              <StudentStaggerItem>
                <StudentClassProgressCard programSlug={programSlug} />
              </StudentStaggerItem>
            </StudentStagger>
          )}

          <StudentReveal delay={0.22}>
            <StudentModuleRoadmap
              programSlug={programSlug}
              currentModule={user.level}
              enrolledModules={enrolledModules}
            />
          </StudentReveal>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <StudentReveal delay={0.16}>
            <StudentWhatsAppGroupCard variant="banner" />
          </StudentReveal>
          <StudentReveal delay={0.2}>
            <StudentTrainerCard programSlug={programSlug} trainerId={user.trainerId} />
          </StudentReveal>

          <StudentStagger className="grid grid-cols-2 gap-2" delay={0.24} stagger={0.06}>
            <StudentStaggerItem>
              <StatCard
                compact
                label="Lessons"
                value={materials.length}
                accent="orange"
                href="/student/course"
              />
            </StudentStaggerItem>
            <StudentStaggerItem>
              <StatCard
                compact
                label="Tasks"
                value={assignments.length}
                accent="blue"
                href="/student/assignments"
              />
            </StudentStaggerItem>
            <StudentStaggerItem>
              <StatCard
                compact
                label="Classes"
                value={sessions.length}
                accent="green"
                href="/student/classes"
              />
            </StudentStaggerItem>
            <StudentStaggerItem>
              <StatCard
                compact
                label="Modules"
                value={enrolledModules.length || user.level || "—"}
                accent="slate"
              />
            </StudentStaggerItem>
          </StudentStagger>

          {moduleEnrollments.length > 1 && (
            <StudentReveal delay={0.3}>
              <PortalSurfaceCard href="/student/profile" className="p-4">
                <p className="text-sm font-semibold text-pt">Multiple module logins</p>
                <p className="text-xs text-pt-muted mt-1">
                  You have {moduleEnrollments.length} approved modules. View passwords on your profile.
                </p>
              </PortalSurfaceCard>
            </StudentReveal>
          )}
        </div>
      </div>

      <StudentReveal delay={0.18}>
        <PortalSectionTitle title="Explore your portal" />
        <StudentStagger
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
          delay={0.08}
          stagger={0.055}
        >
          {[
            {
              href: "/student/course",
              title: "Watch Lessons",
              description: "Course videos & materials",
              icon: <BookOpen size={20} weight="duotone" />,
              gradient: "from-[#1a365d] to-[#122847]",
            },
            {
              href: "/student/assignments",
              title: "Submit Homework",
              description: "View & submit assignments",
              icon: <ClipboardText size={20} weight="duotone" />,
              gradient: "from-[#234876] to-[#1a365d]",
            },
            {
              href: "/student/classes",
              title: "Live Classes",
              description: "Join scheduled sessions",
              icon: <VideoCamera size={20} weight="duotone" />,
              gradient: "from-[#1f6b45] to-[#144d31]",
            },
            {
              href: "/student/recordings",
              title: "Class Recordings",
              description: "Rewatch past classes",
              icon: <FilmStrip size={20} weight="duotone" />,
              gradient: "from-[#8a6d28] to-[#6b5420]",
            },
            {
              href: "/student/trainer",
              title: "My Trainer",
              description: "Meet your instructor",
              icon: <ChalkboardTeacher size={20} weight="duotone" />,
              gradient: "from-[#1e3358] to-[#0e1830]",
            },
            {
              href: "/student/profile",
              title: "My Profile",
              description: "Account & module logins",
              icon: <GraduationCap size={20} weight="duotone" />,
              gradient: "from-slate-700 to-slate-900",
            },
            {
              href: "/student/whatsapp",
              title: "WhatsApp Group",
              description: "Join the class chat",
              icon: <ChatsCircle size={20} weight="duotone" />,
              gradient: "from-[#1f6b45] to-[#163f2c]",
            },
            {
              href: HELP_CONFIG.whatsappUrl,
              title: "Need Help?",
              description: "Message support anytime",
              icon: <ChatsCircle size={20} weight="fill" />,
              gradient: "from-[#234876] to-[#152f52]",
            },
          ].map((item) => (
            <StudentStaggerItem key={item.href + item.title}>
              <QuickActionCard
                href={item.href}
                title={item.title}
                description={item.description}
                icon={item.icon}
                gradient={item.gradient}
              />
            </StudentStaggerItem>
          ))}
        </StudentStagger>
      </StudentReveal>
    </div>
  );
}
