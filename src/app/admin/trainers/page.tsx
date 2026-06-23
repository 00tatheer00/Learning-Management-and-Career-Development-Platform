import { getAdminTrainerRows } from "@/lib/api/admin-trainers";
import { getAdminProgramStats } from "@/lib/api/admin-program-stats";
import { AdminTrainersPanel } from "@/components/admin/admin-trainers-panel";
import { EmptyState } from "@/components/portal/portal-ui";

export default async function AdminTrainersPage() {
  const [trainers, programStats] = await Promise.all([
    getAdminTrainerRows(),
    getAdminProgramStats(),
  ]);

  if (trainers.length === 0) {
    return (
      <div>
        <EmptyState
          title="No trainer accounts"
          description="Add a trainer below or run db:seed to create default accounts."
        />
        <AdminTrainersPanel trainers={[]} programStats={programStats} />
      </div>
    );
  }

  return <AdminTrainersPanel trainers={trainers} programStats={programStats} />;
}
