import { getUsersByRole } from "@/lib/auth/users";
import { getTrainerDesignation, getTrainerCourseTitle } from "@/lib/auth/trainer-scope";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { ENROLLABLE_PROGRAM_SLUGS } from "@/lib/constants/payment";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { Envelope, Phone, BookOpen } from "@phosphor-icons/react/ssr";

export default async function AdminTrainersPage() {
  const trainers = await getUsersByRole("trainer");

  return (
    <div>
      <PortalPageHeader
        title="Trainers by Program"
        description="Each trainer is linked to one program. Web trainers only manage Web students; App trainers only manage App students."
      />

      {trainers.length === 0 ? (
        <EmptyState title="No trainer accounts" description="Run db:seed to create trainer accounts." />
      ) : (
        <div className="space-y-8">
          {ENROLLABLE_PROGRAM_SLUGS.map((slug) => {
            const category = getProgramCategory(slug);
            const programTrainers = trainers.filter((trainer) => trainer.programSlug === slug);
            if (programTrainers.length === 0) return null;

            return (
              <section key={slug}>
                <h2 className="text-lg font-bold mb-4">
                  {category?.title ?? slug}{" "}
                  <span className="text-sm font-normal text-muted">
                    ({programTrainers.length} trainer{programTrainers.length === 1 ? "" : "s"})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {programTrainers.map((trainer) => (
                    <div key={trainer.id} className="rounded-2xl border border-border bg-background p-5">
                      <p className="font-bold text-lg">{trainer.name}</p>
                      <p className="text-sm text-primary mb-1">
                        {getTrainerDesignation(trainer.programSlug)}
                      </p>
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
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
