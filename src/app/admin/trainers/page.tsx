import { getUsersByRole } from "@/lib/auth/users";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { trainers as trainerData } from "@/lib/data/trainers";
import { Envelope, Phone } from "@phosphor-icons/react/ssr";

export default async function AdminTrainersPage() {
  const trainers = await getUsersByRole("trainer");

  return (
    <div>
      <PortalPageHeader title="Trainers" description="Trainer accounts who can manage classes and assignments." />
      {trainers.length === 0 ? (
        <EmptyState title="No trainer accounts" description="Trainer accounts are pre-configured in the system." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trainers.map((trainer) => {
            const info = trainerData.find((t) => t.id === trainer.trainerId);
            return (
              <div key={trainer.id} className="rounded-2xl border border-border bg-background p-5">
                <p className="font-bold text-lg">{trainer.name}</p>
                <p className="text-sm text-primary mb-3">{info?.designation ?? "Trainer"}</p>
                <div className="space-y-1.5 text-sm text-muted">
                  <p className="flex items-center gap-2"><Envelope size={16} weight="duotone" className="text-primary" />{trainer.email}</p>
                  {trainer.phone && <p className="flex items-center gap-2"><Phone size={16} weight="duotone" className="text-primary" />{trainer.phone}</p>}
                </div>
                {info && <p className="text-sm text-muted mt-3 line-clamp-2">{info.bio}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
