import { getAdminTrainerRows } from "@/lib/api/admin-trainers";
import { AdminTrainersPanel } from "@/components/admin/admin-trainers-panel";
import { EmptyState } from "@/components/portal/portal-ui";

export default async function AdminTrainersPage() {
  const trainers = await getAdminTrainerRows();

  if (trainers.length === 0) {
    return (
      <div>
        <EmptyState title="No trainer accounts" description="Run db:seed to create trainer accounts." />
      </div>
    );
  }

  return <AdminTrainersPanel trainers={trainers} />;
}
