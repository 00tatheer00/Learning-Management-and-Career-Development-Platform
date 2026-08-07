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
        <Button size="sm" asChild className="h-9 px-4 text-xs font-semibold shadow-sm bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 transition-all">
          <Link href="/trainer/classes">
            <VideoCamera size={15} weight="duotone" className="mr-1.5" />
            Portal Classes
          </Link>
        </Button>
      </PortalPageHeader>

      {!isAll && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
            </span>
            <span className="text-xs text-slate-300 font-medium truncate">
              Active Module Scope: <strong className="font-extrabold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs ml-2 inline-block shadow-sm">{activeLevel}</strong>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
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
            <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Link href="/trainer/students">View Student Roster →</Link>
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/trainer/students?phase=phase-1"
            className={cn(
              portalPressable,
              "group relative overflow-hidden rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-600 hover:shadow-md block transition-all duration-200 transform hover:-translate-y-0.5"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                  Initial Admissions
                </span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">Phase 1 (Module 1)</p>
                <p className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                  {phase1Students.length} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Students</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Users size={22} weight="bold" />
              </div>
            </div>
          </Link>

          <Link
            href="/trainer/students?phase=phase-2"
            className={cn(
              portalPressable,
              "group relative overflow-hidden rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-emerald-600 hover:shadow-md block transition-all duration-200 transform hover:-translate-y-0.5"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  New Phase Admissions
                </span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">Phase 2 (New Phase / 2nd Module)</p>
                <p className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                  {phase2Students.length} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Students</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Users size={22} weight="bold" />
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
              <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Link href="/trainer/students">View all →</Link>
              </Button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {moduleGroups.map((group, idx) => (
              <Link
                key={group.moduleName}
                href={`/trainer/students?module=${encodeURIComponent(group.moduleName)}`}
                className={cn(
                  portalPressable,
                  "group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md block transition-all duration-200 transform hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    Module {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {group.students.length} {group.students.length === 1 ? "Student" : "Students"}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-3 group-hover:text-primary transition-colors">
                  {group.moduleName}
                </h4>
                <p className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                  {group.students.length}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="space-y-3 pt-2">
        <PortalSectionTitle title="Quick Access" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickActionCard href="/trainer/students" title="View Students" description={`Students in ${courseTitle}`} icon={<Users size={20} weight="duotone" />} gradient="from-blue-600 to-indigo-600" />
          <QuickActionCard href="/trainer/classes" title="Portal Classes" description="Free in-portal live video" icon={<VideoCamera size={20} weight="duotone" />} gradient="from-amber-600 to-orange-600" />
          <QuickActionCard href="/trainer/assignments" title="Assignments" description="Create & review work" icon={<ClipboardText size={20} weight="duotone" />} gradient="from-purple-600 to-violet-600" />
          <QuickActionCard href="/trainer/attendance" title="Attendance" description="Day & module-wise reports" icon={<ListChecks size={20} weight="duotone" />} gradient="from-slate-700 to-slate-900" />
          <QuickActionCard href="/trainer/materials" title="Course Videos" description="Learning materials" icon={<BookOpen size={20} weight="duotone" />} gradient="from-emerald-600 to-teal-600" />
        </div>
      </div>
    </div>
  );
}
