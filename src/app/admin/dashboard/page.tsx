import { getPortalStats } from "@/lib/api/portal-data";
import { AdminDashboardHome } from "@/components/admin/admin-dashboard-home";

export default async function AdminDashboardPage() {
  const stats = await getPortalStats();

  return <AdminDashboardHome stats={stats} />;
}
