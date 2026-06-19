import { getUsersByRole } from "@/lib/auth/users";
import { getTrainerDesignation, getTrainerCourseTitle } from "@/lib/auth/trainer-scope";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { Envelope, Phone, BookOpen } from "@phosphor-icons/react/ssr";

export default async function AdminTrainersPage() {
  const trainers = await getUsersByRole("trainer");

  return (
    <div>
      <PortalPageHeader title="Trainers" description="Trainer accounts who manage classes and assignments for their course." />
      {trainers.length === 0 ? (
        <EmptyState title="No trainer accounts" description="Run db:seed to create trainer accounts." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="rounded-2xl border border-border bg-background p-5">
              <p className="font-bold text-lg">{trainer.name}</p>
              <p className="text-sm text-primary mb-1">{getTrainerDesignation(trainer.programSlug)}</p>
              <p className="text-sm text-muted mb-3 flex items-center gap-2">
                <BookOpen size={16} weight="duotone" className="text-primary" />
                {getTrainerCourseTitle(trainer.programSlug)}
              </p>
              <div className="space-y-1.5 text-sm text-muted">
                <p className="flex items-center gap-2">
                  <Envelope size={16} weight="duotone" className="text-primary" />
                  {trainer.email}
                </p>
                {trainer.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={16} weight="duotone" className="text-primary" />
                    {trainer.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
