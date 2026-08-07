import Link from "next/link";
import { Users, VideoCamera, ClipboardText, BookOpen, ListChecks } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import {
  filterStudentsByProgram,
  getTrainerCourseTitle,
  getTrainerDesignation,
  resolveTrainerId,
} from "@/lib/auth/trainer-scope";
import { countUpcomingLiveSessions } from "@/lib/sessions/join-window";
import { getAssignments, getLiveSessions, getSubmissions } from "@/lib/api/portal-data";
import { getUsersByRole } from "@/lib/auth/users";
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
    <div className="space-y-4">
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title={`Welcome, ${welcomeName}!`}
        description={`${designation} · ${courseTitle}`}
      >
        <Button size="sm" asChild className="h-8 text-xs">
          <Link href="/trainer/classes">Portal Classes</Link>
        </Button>
      </PortalPageHeader>

      {!isAll && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="truncate">
              Active Module Scope: <strong className="font-bold text-pt">{activeLevel}</strong>
            </span>
          </div>
          <span className="text-[10px] text-pt-muted uppercase tracking-wider font-semibold shrink-0">
            {students.length} Enrolled Students
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard compact label="My Students" value={students.length} accent="blue" icon={<Users size={16} weight="duotone" />} href="/trainer/students" />
        <StatCard compact label="Assignments" value={assignments.length} accent="orange" icon={<ClipboardText size={16} weight="duotone" />} href="/trainer/assignments" />
        <StatCard compact label="Upcoming Classes" value={upcomingSessions} accent="green" icon={<VideoCamera size={16} weight="duotone" />} href="/trainer/classes" />
        <StatCard compact label="To Review" value={pendingReviews} accent="slate" hint="Pending submissions" icon={<ClipboardText size={16} weight="duotone" />} href="/trainer/assignments" />
      </div>

      {/* Registration Phases Breakdown */}
      <div>
        <PortalSectionTitle
          title="Students by Phase"
          action={
            <Button variant="outline" size="sm" asChild className="h-7 text-xs">
              <Link href="/trainer/students">View Student Roster</Link>
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Link
            href="/trainer/students?phase=phase-1"
            className={cn(
              portalPressable,
              "rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 shadow-sm hover:border-indigo-500 hover:shadow-md block transition-all"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Phase 1 (Module 1)</p>
                <p className="text-2xl font-bold tabular-nums text-pt mt-1">{phase1Students.length} Students</p>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                Initial Admissions
              </span>
            </div>
          </Link>

          <Link
            href="/trainer/students?phase=phase-2"
            className={cn(
              portalPressable,
              "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 shadow-sm hover:border-emerald-500 hover:shadow-md block transition-all"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Phase 2 (New Phase / 2nd Module)</p>
                <p className="text-2xl font-bold tabular-nums text-pt mt-1">{phase2Students.length} Students</p>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 animate-pulse">
                New Phase Admissions
              </span>
            </div>
          </Link>
        </div>
      </div>

      {moduleGroups.length > 0 && (
        <div>
          <PortalSectionTitle
            title="Students by Module"
            action={
              <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                <Link href="/trainer/students">View all</Link>
              </Button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {moduleGroups.map((group) => (
              <Link
                key={group.moduleName}
                href={`/trainer/students?module=${encodeURIComponent(group.moduleName)}`}
                className={cn(
                  portalPressable,
                  "rounded-xl border border-pt-subtle bg-pt-surface p-3 shadow-sm hover:border-primary/30 hover:shadow-md block"
                )}
              >
                <p className="text-[10px] font-semibold text-pt-muted truncate">{group.moduleName}</p>
                <p className="text-xl font-bold tabular-nums text-pt mt-0.5">{group.students.length}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <PortalSectionTitle title="Quick Access" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QuickActionCard compact href="/trainer/students" title="View Students" description={`Students in ${courseTitle}`} icon={<Users size={18} weight="duotone" />} gradient="from-blue-500 to-indigo-500" />
          <QuickActionCard compact href="/trainer/classes" title="Portal Classes" description="Free in-portal live video" icon={<VideoCamera size={18} weight="duotone" />} gradient="from-orange-500 to-amber-500" />
          <QuickActionCard compact href="/trainer/assignments" title="Assignments" description="Create & review work" icon={<ClipboardText size={18} weight="duotone" />} gradient="from-violet-500 to-purple-600" />
          <QuickActionCard compact href="/trainer/attendance" title="Attendance" description="Day & module-wise reports" icon={<ListChecks size={18} weight="duotone" />} gradient="from-slate-600 to-slate-800" />
          <QuickActionCard compact href="/trainer/materials" title="Course Videos" description="Learning materials" icon={<BookOpen size={18} weight="duotone" />} gradient="from-emerald-500 to-teal-600" />
        </div>
      </div>
    </div>
  );
}
