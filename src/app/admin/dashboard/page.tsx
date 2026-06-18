import Link from "next/link";
import { ClipboardText, Users, GraduationCap, VideoCamera } from "@phosphor-icons/react/ssr";
import { getPortalStats } from "@/lib/api/portal-data";
import { PortalPageHeader, StatCard, QuickActionCard } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const stats = await getPortalStats();

  return (
    <div>
      <PortalPageHeader
        title="Admin Dashboard"
        description="Overview of registrations, students, and portal activity."
      >
        <Button size="lg" asChild>
          <Link href="/admin/enrollments">Review Registrations</Link>
        </Button>
      </PortalPageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Pending Registrations" value={stats.pendingEnrollments} accent="orange" hint="Need your approval" />
        <StatCard label="Approved Students" value={stats.approvedEnrollments} accent="green" />
        <StatCard label="Total Registrations" value={stats.totalEnrollments} accent="slate" />
        <StatCard label="Portal Students" value={stats.students} accent="blue" />
        <StatCard label="Assignments" value={stats.assignments} accent="orange" />
        <StatCard label="Upcoming Classes" value={stats.upcomingSessions} accent="green" />
      </div>

      {stats.pendingEnrollments > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-amber-900">{stats.pendingEnrollments} registration(s) waiting for approval</p>
            <p className="text-sm text-amber-800">Check payment screenshot and approve or reject.</p>
          </div>
          <Button size="lg" asChild>
            <Link href="/admin/enrollments">Review Now</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickActionCard href="/admin/enrollments" title="Registrations" description="Approve new student applications" icon={<ClipboardText size={24} weight="duotone" />} />
        <QuickActionCard href="/admin/students" title="Students" description="View all student accounts" icon={<GraduationCap size={24} weight="duotone" />} color="bg-blue-500/10 text-blue-600" />
        <QuickActionCard href="/admin/trainers" title="Trainers" description="View trainer accounts" icon={<Users size={24} weight="duotone" />} color="bg-indigo-500/10 text-indigo-600" />
        <QuickActionCard href="/admin/courses" title="Courses" description="View course materials" icon={<VideoCamera size={24} weight="duotone" />} color="bg-emerald-500/10 text-emerald-600" />
      </div>
    </div>
  );
}
