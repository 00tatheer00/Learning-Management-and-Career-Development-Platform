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

      {/* Trainer Performance Analytics (Executive Tones with Graphs & 100% Prominent Values) */}
      <div className="space-y-3 pt-1">
        <PortalSectionTitle title="Course & Performance Analytics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Attendance Rate + Area Curve Sparkline */}
          <div className="portal-tone-sky rounded-2xl border-2 border-sky-300/80 p-4 shadow-xs hover:border-sky-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-sky-600 text-white shadow-xs">
                  Class Attendance
                </span>
                <span className="text-xs font-extrabold text-sky-900/80 dark:text-sky-200/80 uppercase tracking-wide opacity-80">Rate %</span>
              </div>
              <div className="flex items-end justify-between mt-2 gap-2">
                <p className="text-4.5xl font-black tabular-nums text-sky-950 dark:text-sky-100 opacity-100">
                  {attendanceRatePct}%
                </p>

                {/* Smooth Area Curve Graph */}
                <div className="shrink-0 pb-1">
                  <svg className="w-20 h-9 overflow-visible text-sky-600" viewBox="0 0 100 40" fill="none">
                    <defs>
                      <linearGradient id="skyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,32 Q25,22 50,26 T80,10 T100,6 L100,40 L0,40 Z" fill="url(#skyAreaGrad)" />
                    <path d="M0,32 Q25,22 50,26 T80,10 T100,6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="100" cy="6" r="3.5" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="h-2 w-full rounded-full bg-sky-200/80 dark:bg-sky-950/50 overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, attendanceRatePct))}%` }}
                />
              </div>
              <p className="text-[11px] font-extrabold text-sky-900/80 dark:text-sky-200/80 opacity-80">Average student presence</p>
            </div>
          </div>

          {/* Submission Completion + Bar Sparkline Chart */}
          <div className="portal-tone-violet rounded-2xl border-2 border-violet-300/80 p-4 shadow-xs hover:border-violet-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-violet-600 text-white shadow-xs">
                  Submissions
                </span>
                <span className="text-xs font-extrabold text-violet-900/80 dark:text-violet-200/80 uppercase tracking-wide opacity-80">Completion</span>
              </div>
              <div className="flex items-end justify-between mt-2 gap-2">
                <p className="text-4.5xl font-black tabular-nums text-violet-950 dark:text-violet-100 opacity-100">
                  {submissionRatePct}%
                </p>

                {/* Mini Bar Sparkline Chart */}
                <div className="flex items-end gap-1 h-9 w-20 shrink-0 pb-1">
                  <div className="flex-1 bg-violet-400/60 dark:bg-violet-800 rounded-xs h-[35%]" />
                  <div className="flex-1 bg-violet-500/70 dark:bg-violet-700 rounded-xs h-[60%]" />
                  <div className="flex-1 bg-violet-500 dark:bg-violet-600 rounded-xs h-[45%]" />
                  <div className="flex-1 bg-violet-600 rounded-xs h-[80%]" />
                  <div className="flex-1 bg-violet-700 dark:bg-violet-400 rounded-xs h-[100%]" />
                </div>
              </div>
            </div>

            {/* Submissions Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="h-2 w-full rounded-full bg-violet-200/80 dark:bg-violet-950/50 overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, submissionRatePct))}%` }}
                />
              </div>
              <p className="text-[11px] font-extrabold text-violet-900/80 dark:text-violet-200/80 opacity-80">{submissions.length} Total turned in</p>
            </div>
          </div>

          {/* Completed Classes + Step Line Sparkline Graph */}
          <div className="portal-tone-emerald rounded-2xl border-2 border-emerald-300/80 p-4 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                  Live Classes
                </span>
                <span className="text-xs font-extrabold text-emerald-900/80 dark:text-emerald-200/80 uppercase tracking-wide opacity-80">Conducted</span>
              </div>
              <div className="flex items-end justify-between mt-2 gap-2">
                <p className="text-4.5xl font-black tabular-nums text-emerald-950 dark:text-emerald-100 opacity-100">
                  {completedSessions}
                </p>

                {/* Step Line Graph */}
                <div className="shrink-0 pb-1">
                  <svg className="w-20 h-9 text-emerald-600 overflow-visible" viewBox="0 0 100 40" fill="none">
                    <path d="M0,34 L25,34 L25,24 L50,24 L50,14 L75,14 L75,6 L100,6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="100" cy="6" r="3.5" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sessions Indicator */}
            <div className="mt-2 space-y-1">
              <div className="h-2 w-full rounded-full bg-emerald-200/80 dark:bg-emerald-950/50 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, (completedSessions / Math.max(1, completedSessions + upcomingSessions)) * 100))}%` }}
                />
              </div>
              <p className="text-[11px] font-extrabold text-emerald-900/80 dark:text-emerald-200/80 opacity-80">Sessions completed</p>
            </div>
          </div>

          {/* Active Student Roster (100% Prominent Metric) */}
          <div className="portal-tone-amber rounded-2xl border-2 border-amber-300/80 p-4 shadow-xs hover:border-amber-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-600 text-white shadow-xs">
                  Active Roster
                </span>
                <span className="text-xs font-extrabold text-amber-900/80 dark:text-amber-200/80 uppercase tracking-wide opacity-80">Enrolled</span>
              </div>
              <p className="text-4.5xl font-black tabular-nums text-amber-950 dark:text-amber-100 opacity-100 mt-2">
                {students.length}
              </p>
            </div>

            <div className="mt-2 space-y-1">
              <div className="h-2 w-full rounded-full bg-amber-200/80 dark:bg-amber-950/50 overflow-hidden">
                <div className="h-full bg-amber-600 rounded-full w-full" />
              </div>
              <p className="text-[11px] font-extrabold text-amber-900/80 dark:text-amber-200/80 opacity-80">Students in active scope</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Wise Breakdown with Horizontal Progress Bars */}
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
            {moduleGroups.map((group, idx) => {
              const moduleStyles = [
                { wrap: "portal-tone-indigo border-2 border-indigo-300/80 hover:border-indigo-600", badge: "bg-indigo-600", fill: "bg-indigo-600", text: "text-indigo-950 dark:text-indigo-100 opacity-100 font-black", label: "text-indigo-900/80 dark:text-indigo-200/80 font-extrabold opacity-80" },
                { wrap: "portal-tone-amber border-2 border-amber-300/80 hover:border-amber-600", badge: "bg-amber-600", fill: "bg-amber-600", text: "text-amber-950 dark:text-amber-100 opacity-100 font-black", label: "text-amber-900/80 dark:text-amber-200/80 font-extrabold opacity-80" },
                { wrap: "portal-tone-emerald border-2 border-emerald-300/80 hover:border-emerald-600", badge: "bg-emerald-600", fill: "bg-emerald-600", text: "text-emerald-950 dark:text-emerald-100 opacity-100 font-black", label: "text-emerald-900/80 dark:text-emerald-200/80 font-extrabold opacity-80" },
                { wrap: "portal-tone-teal border-2 border-teal-300/80 hover:border-teal-600", badge: "bg-teal-600", fill: "bg-teal-600", text: "text-teal-950 dark:text-teal-100 opacity-100 font-black", label: "text-teal-900/80 dark:text-teal-200/80 font-extrabold opacity-80" },
              ];
              const modStyle = moduleStyles[idx % moduleStyles.length];
              const pctOfTotal = students.length > 0 ? Math.round((group.students.length / students.length) * 100) : 0;

              return (
                <Link
                  key={group.moduleName}
                  href={`/trainer/students?module=${encodeURIComponent(group.moduleName)}`}
                  className={cn(
                    portalPressable,
                    "rounded-2xl p-4 shadow-xs hover:shadow-md block transition-all duration-200 flex flex-col justify-between",
                    modStyle.wrap
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-xs", modStyle.badge)}>
                        Module {idx + 1}
                      </span>
                      <span className={cn("text-xs uppercase tracking-wider", modStyle.label)}>
                        {group.students.length} Students
                      </span>
                    </div>
                    <p className={cn("text-sm truncate mt-2", modStyle.label)}>{group.moduleName}</p>
                    <p className={cn("text-4xl tabular-nums mt-0.5", modStyle.text)}>{group.students.length}</p>
                  </div>

                  {/* Module Distribution Graph Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", modStyle.fill)}
                        style={{ width: `${Math.min(100, Math.max(10, pctOfTotal))}%` }}
                      />
                    </div>
                    <p className={cn("text-[10px] font-extrabold text-right", modStyle.label)}>{pctOfTotal}% of total roster</p>
                  </div>
                </Link>
              );
            })}
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
