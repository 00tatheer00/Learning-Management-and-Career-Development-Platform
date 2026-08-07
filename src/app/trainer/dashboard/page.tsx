import Link from "next/link";
import { Users, VideoCamera, ClipboardText, BookOpen, ListChecks } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getTrainerCourseTitle,
  getTrainerDesignation,
  resolveTrainerId,
} from "@/lib/auth/trainer-scope";
import { countUpcomingLiveSessions } from "@/lib/sessions/join-window";
import { getAssignments, getLiveSessions, getSubmissions } from "@/lib/api/portal-data";
import { groupStudentsByModule } from "@/lib/trainer/group-students-by-module";
import {
  PortalPageHeader,
  PortalSectionTitle,
  PortalSurfaceCard,
  StatCard,
  QuickActionCard,
  portalPressable,
} from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { syncApprovedStudentsTrainerAssignments } from "@/lib/auth/trainer-assignment-sync";
import { getRegistrationPhase } from "@/lib/constants/batch";
import { getTrainerApprovedStudents } from "@/lib/api/trainer-students-sync";

export default async function TrainerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug;
  if (!programSlug) {
    return (
      <PortalSurfaceCard className="p-6 text-sm text-pt-muted">
        Your trainer account is not linked to a course yet. Contact admin.
      </PortalSurfaceCard>
    );
  }

  const trainerId = resolveTrainerId(user);
  const courseTitle = getTrainerCourseTitle(programSlug);
  const designation = getTrainerDesignation(programSlug);

  void syncApprovedStudentsTrainerAssignments().catch((err) => {
    console.error("Background sync error:", err);
  });

  const [allProgramStudents, allAssignments, allSessions, allSubmissions] = await Promise.all([
    getTrainerApprovedStudents(programSlug),
    getAssignments(programSlug),
    getLiveSessions(programSlug),
    getSubmissions(),
  ]);

  const activeLevel = user.level?.trim();
  const isAll = !activeLevel || activeLevel === "all";

  const students = isAll
    ? allProgramStudents
    : allProgramStudents.filter((st) => st.level === activeLevel);

  const assignments = isAll
    ? allAssignments.filter((a) => a.trainerId === trainerId)
    : allAssignments.filter((a) => a.trainerId === trainerId && (!a.level || a.level === activeLevel));

  const sessions = isAll
    ? allSessions.filter((s) => s.trainerId === trainerId)
    : allSessions.filter((s) => s.trainerId === trainerId && (!s.level || s.level === activeLevel));

  const moduleGroups = groupStudentsByModule(allProgramStudents, programSlug);
  const assignmentIds = new Set(assignments.map((a) => a.id));
  const submissions = allSubmissions.filter((s) => assignmentIds.has(s.assignmentId));

  const phase1Students = allProgramStudents.filter((st) => getRegistrationPhase(st) === "phase-1");
  const phase2Students = allProgramStudents.filter((st) => getRegistrationPhase(st) === "phase-2");

  const pendingReviews = submissions.filter((s) => s.status === "submitted").length;
  const upcomingSessions = countUpcomingLiveSessions(sessions);

  const nameParts = user.name.trim().split(/\s+/);
  const welcomeName =
    nameParts.length > 1 && nameParts[0].length <= 2
      ? `${nameParts[0]} ${nameParts[1]}`
      : nameParts[0] || user.name;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title={`Welcome, ${welcomeName}!`}
        description={`${designation} · ${courseTitle}`}
      >
        <Button size="sm" asChild className="h-9 px-4 text-xs font-semibold shadow-sm bg-gradient-to-r from-primary to-primary/90 hover:opacity-95 transition-all">
          <Link href="/trainer/classes">
            <VideoCamera size={15} weight="duotone" className="mr-1.5" />
            Portal Classes
          </Link>
        </Button>
      </PortalPageHeader>

      {!isAll && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/8 to-transparent border border-amber-500/25 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span className="text-xs text-pt-secondary font-medium truncate">
              Active Module Scope: <strong className="font-bold text-amber-700 dark:text-amber-300 text-sm ml-1">{activeLevel}</strong>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
            {students.length} Enrolled Students
          </span>
        </div>
      )}

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard label="My Students" value={students.length} accent="blue" icon={<Users size={20} weight="duotone" />} href="/trainer/students" />
        <StatCard label="Assignments" value={assignments.length} accent="orange" icon={<ClipboardText size={20} weight="duotone" />} href="/trainer/assignments" />
        <StatCard label="Upcoming Classes" value={upcomingSessions} accent="green" icon={<VideoCamera size={20} weight="duotone" />} href="/trainer/classes" />
        <StatCard label="To Review" value={pendingReviews} accent="rose" hint="Pending submissions" icon={<ListChecks size={20} weight="duotone" />} href="/trainer/assignments" />
      </div>

      {/* Registration Phases Breakdown */}
      <div className="space-y-3">
        <PortalSectionTitle
          title="Students by Phase"
          action={
            <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold rounded-xl border-pt-subtle hover:bg-pt-surface hover:border-primary/30">
              <Link href="/trainer/students">View Student Roster →</Link>
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/trainer/students?phase=phase-1"
            className={cn(
              portalPressable,
              "group relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 block transition-all duration-300 transform hover:-translate-y-0.5"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                  Initial Admissions
                </span>
                <p className="text-xs font-semibold text-pt-muted mt-2.5">Phase 1 (Module 1)</p>
                <p className="text-3xl font-extrabold tabular-nums text-pt tracking-tight mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {phase1Students.length} <span className="text-sm font-semibold text-pt-muted">Students</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 shrink-0 group-hover:scale-110 transition-transform">
                <Users size={22} weight="duotone" />
              </div>
            </div>
          </Link>

          <Link
            href="/trainer/students?phase=phase-2"
            className={cn(
              portalPressable,
              "group relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 shadow-sm hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 block transition-all duration-300 transform hover:-translate-y-0.5"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  New Phase Admissions
                </span>
                <p className="text-xs font-semibold text-pt-muted mt-2.5">Phase 2 (New Phase / 2nd Module)</p>
                <p className="text-3xl font-extrabold tabular-nums text-pt tracking-tight mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {phase2Students.length} <span className="text-sm font-semibold text-pt-muted">Students</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 shrink-0 group-hover:scale-110 transition-transform">
                <Users size={22} weight="duotone" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Module Wise Breakdown */}
      {moduleGroups.length > 0 && (
        <div className="space-y-3">
          <PortalSectionTitle
            title="Students by Module"
            action={
              <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold rounded-xl border-pt-subtle hover:bg-pt-surface hover:border-primary/30">
                <Link href="/trainer/students">View all →</Link>
              </Button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {moduleGroups.map((group, idx) => {
              const gradients = [
                "from-blue-500/10 via-cyan-500/5 to-transparent border-blue-500/20 hover:border-blue-500/40 text-blue-600 dark:text-blue-400",
                "from-violet-500/10 via-purple-500/5 to-transparent border-violet-500/20 hover:border-violet-500/40 text-violet-600 dark:text-violet-400",
                "from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20 hover:border-amber-500/40 text-amber-600 dark:text-amber-400",
                "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
              ];
              const cardStyle = gradients[idx % gradients.length];

              return (
                <Link
                  key={group.moduleName}
                  href={`/trainer/students?module=${encodeURIComponent(group.moduleName)}`}
                  className={cn(
                    portalPressable,
                    "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm hover:shadow-md block transition-all duration-300 transform hover:-translate-y-0.5",
                    cardStyle
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-pt-surface/80 border border-pt-subtle text-pt-secondary">
                      Module {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-pt-muted group-hover:text-primary transition-colors">
                      {group.students.length} {group.students.length === 1 ? "Student" : "Students"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-pt truncate mt-3 group-hover:text-primary transition-colors">
                    {group.moduleName}
                  </h4>
                  <p className="text-2xl font-extrabold tabular-nums text-pt mt-1">
                    {group.students.length}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="space-y-3 pt-2">
        <PortalSectionTitle title="Quick Access" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickActionCard href="/trainer/students" title="View Students" description={`Students in ${courseTitle}`} icon={<Users size={20} weight="duotone" />} gradient="from-blue-500 to-indigo-500" />
          <QuickActionCard href="/trainer/classes" title="Portal Classes" description="Free in-portal live video" icon={<VideoCamera size={20} weight="duotone" />} gradient="from-orange-500 to-amber-500" />
          <QuickActionCard href="/trainer/assignments" title="Assignments" description="Create & review work" icon={<ClipboardText size={20} weight="duotone" />} gradient="from-violet-500 to-purple-600" />
          <QuickActionCard href="/trainer/attendance" title="Attendance" description="Day & module-wise reports" icon={<ListChecks size={20} weight="duotone" />} gradient="from-slate-600 to-slate-800" />
          <QuickActionCard href="/trainer/materials" title="Course Videos" description="Learning materials" icon={<BookOpen size={20} weight="duotone" />} gradient="from-emerald-500 to-teal-600" />
        </div>
      </div>
    </div>
  );
}
