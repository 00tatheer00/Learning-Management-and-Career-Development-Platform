import Link from "next/link";
import { ClipboardText, Users, GraduationCap, VideoCamera, Key } from "@phosphor-icons/react/ssr";
import { getPortalStats } from "@/lib/api/portal-data";
import { StatCard, QuickActionCard } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const stats = await getPortalStats();

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-2.5rem)] max-h-[calc(100dvh-3.5rem-2.5rem)] overflow-hidden gap-3">
      <div className="shrink-0 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted mt-0.5">Registrations, students & portal overview</p>
        </div>
        <Button size="sm" asChild className="h-8 text-xs shrink-0">
          <Link href="/admin/enrollments">Review Registrations</Link>
        </Button>
      </div>

      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-3 gap-2">
        <StatCard
          compact
          label="Pending Registrations"
          value={stats.pendingEnrollments}
          accent="orange"
          hint="Need approval"
        />
        <StatCard
          compact
          label="Paid Registrations"
          value={stats.approvedEnrollments}
          accent="green"
          hint={
            stats.returningRegistrations > 0
              ? `${stats.returningRegistrations} returning`
              : `${stats.students} accounts`
          }
        />
        <StatCard compact label="Total Registrations" value={stats.totalEnrollments} accent="slate" />
        <StatCard
          compact
          label="Login Accounts"
          value={stats.students}
          accent="blue"
          hint={
            stats.missingTrainerAssignments > 0
              ? `${stats.missingTrainerAssignments} need sync`
              : `${stats.trainerAssignedStudents} with trainer`
          }
        />
        <StatCard compact label="Assignments" value={stats.assignments} accent="orange" />
        <StatCard compact label="Upcoming Classes" value={stats.upcomingSessions} accent="green" />
      </div>

      {stats.pendingEnrollments > 0 && (
        <div className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-amber-900">
            {stats.pendingEnrollments} registration(s) waiting for approval
          </p>
          <Button size="sm" asChild className="h-7 text-xs shrink-0">
            <Link href="/admin/enrollments">Review</Link>
          </Button>
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 content-start">
        <QuickActionCard
          compact
          href="/admin/enrollments"
          title="Registrations"
          description="Approve new applications"
          icon={<ClipboardText size={18} weight="duotone" />}
        />
        <QuickActionCard
          compact
          href="/admin/students"
          title="Students"
          description="All student accounts"
          icon={<GraduationCap size={18} weight="duotone" />}
          color="bg-blue-500/10 text-blue-600"
        />
        <QuickActionCard
          compact
          href="/admin/credentials"
          title="Portal Logins"
          description="Login IDs & passwords"
          icon={<Key size={18} weight="duotone" />}
          color="bg-amber-500/10 text-amber-700"
        />
        <QuickActionCard
          compact
          href="/admin/trainers"
          title="Trainers"
          description="Trainer accounts"
          icon={<Users size={18} weight="duotone" />}
          color="bg-indigo-500/10 text-indigo-600"
        />
        <QuickActionCard
          compact
          href="/admin/courses"
          title="Courses"
          description="Course materials"
          icon={<VideoCamera size={18} weight="duotone" />}
          color="bg-emerald-500/10 text-emerald-600"
        />
      </div>
    </div>
  );
}
