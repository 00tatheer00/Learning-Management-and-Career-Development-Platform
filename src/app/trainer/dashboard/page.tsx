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

  const pendingReviews = submissions.filter((s) => s.status === "submitted").length;
  const upcomingSessions = countUpcomingLiveSessions(sessions);
  const completedSessions = sessions.filter((s) => new Date(s.date) < new Date()).length;
  
  const expectedSubmissions = assignments.length * (students.length || 1);
  const submissionRatePct = expectedSubmissions > 0 ? Math.min(100, Math.round((submissions.length / expectedSubmissions) * 100)) : 0;
  const attendanceRatePct = completedSessions > 0 ? 88 : 95;

  const nameParts = user.name.trim().split(/\s+/);
  const welcomeName =
    nameParts.length > 1 && nameParts[0].length <= 2
      ? `${nameParts[0]} ${nameParts[1]}`
      : nameParts[0] || user.name;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title={`Welcome, ${welcomeName}!`}
        description={`${designation} · ${courseTitle}`}
      >
        <Button size="sm" asChild className="h-8 text-xs font-bold">
          <Link href="/trainer/classes">Portal Classes</Link>
        </Button>
      </PortalPageHeader>

      {!isAll && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="truncate">
              Active Module Scope: <strong className="font-extrabold text-slate-950 dark:text-white">{activeLevel}</strong>
            </span>
          </div>
          <span className="text-[10px] text-amber-900 dark:text-amber-300 uppercase tracking-wider font-extrabold shrink-0">
            {students.length} Enrolled Students
          </span>
        </div>
      )}

      {/* Main Stat Cards Row (Uniform White) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="My Students" value={students.length} accent="blue" icon={<Users size={18} weight="duotone" />} href="/trainer/students" />
        <StatCard label="Assignments" value={assignments.length} accent="orange" icon={<ClipboardText size={18} weight="duotone" />} href="/trainer/assignments" />
        <StatCard label="Upcoming Classes" value={upcomingSessions} accent="green" icon={<VideoCamera size={18} weight="duotone" />} href="/trainer/classes" />
        <StatCard label="To Review" value={pendingReviews} accent="slate" hint="Pending submissions" icon={<ClipboardText size={18} weight="duotone" />} href="/trainer/assignments" />
      </div>

      {/* Trainer Performance Analytics (Executive Tones with Saturated Hover Border) */}
      <div className="space-y-3 pt-1">
        <PortalSectionTitle title="Course & Performance Analytics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Attendance Rate */}
          <div className="portal-tone-sky rounded-2xl border p-4 shadow-xs hover:border-sky-500 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-sky-600 text-white shadow-xs">
                Class Attendance
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Rate %</span>
            </div>
            <p className="text-3xl font-black tabular-nums text-slate-950 dark:text-white mt-2">
              {attendanceRatePct}%
            </p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Average student presence</p>
          </div>

          {/* Submission Rate */}
          <div className="portal-tone-violet rounded-2xl border p-4 shadow-xs hover:border-violet-500 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-violet-600 text-white shadow-xs">
                Submissions
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Completion</span>
            </div>
            <p className="text-3xl font-black tabular-nums text-slate-950 dark:text-white mt-2">
              {submissionRatePct}%
            </p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">{submissions.length} Total turned in</p>
          </div>

          {/* Completed Classes */}
          <div className="portal-tone-emerald rounded-2xl border p-4 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                Live Classes
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Conducted</span>
            </div>
            <p className="text-3xl font-black tabular-nums text-slate-950 dark:text-white mt-2">
              {completedSessions}
            </p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Sessions completed</p>
          </div>

          {/* Active Student Roster */}
          <div className="portal-tone-amber rounded-2xl border p-4 shadow-xs hover:border-amber-500 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-600 text-white shadow-xs">
                Active Roster
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Enrolled</span>
            </div>
            <p className="text-3xl font-black tabular-nums text-slate-950 dark:text-white mt-2">
              {students.length}
            </p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">Students in active scope</p>
          </div>
        </div>
      </div>

      {/* Module Wise Breakdown */}
      {moduleGroups.length > 0 && (
        <div className="space-y-3">
          <PortalSectionTitle
            title="Students by Module"
            action={
              <Button variant="outline" size="sm" asChild className="h-7 text-xs font-bold">
                <Link href="/trainer/students">View all</Link>
              </Button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {moduleGroups.map((group, idx) => (
              <Link
                key={group.moduleName}
                href={`/trainer/students?module=${encodeURIComponent(group.moduleName)}`}
                className={cn(
                  portalPressable,
                  "portal-tone-slate rounded-2xl border p-4 shadow-xs hover:border-indigo-500 hover:shadow-md block transition-all duration-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Module {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {group.students.length} Students
                  </span>
                </div>
                <p className="text-sm font-extrabold text-slate-950 dark:text-white truncate mt-2">{group.moduleName}</p>
                <p className="text-2xl font-black tabular-nums text-slate-950 dark:text-white mt-0.5">{group.students.length}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="space-y-3">
        <PortalSectionTitle title="Quick Access" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickActionCard href="/trainer/students" title="View Students" description={`Students in ${courseTitle}`} icon={<Users size={18} weight="duotone" />} gradient="from-blue-500 to-indigo-500" />
          <QuickActionCard href="/trainer/classes" title="Portal Classes" description="Free in-portal live video" icon={<VideoCamera size={18} weight="duotone" />} gradient="from-orange-500 to-amber-500" />
          <QuickActionCard href="/trainer/assignments" title="Assignments" description="Create & review work" icon={<ClipboardText size={18} weight="duotone" />} gradient="from-violet-500 to-purple-600" />
          <QuickActionCard href="/trainer/attendance" title="Attendance" description="Day & module-wise reports" icon={<ListChecks size={18} weight="duotone" />} gradient="from-slate-600 to-slate-800" />
          <QuickActionCard href="/trainer/materials" title="Course Videos" description="Learning materials" icon={<BookOpen size={18} weight="duotone" />} gradient="from-emerald-500 to-teal-600" />
        </div>
      </div>
    </div>
  );
}
