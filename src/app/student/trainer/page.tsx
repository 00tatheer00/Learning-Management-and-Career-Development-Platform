import { getCurrentUser } from "@/lib/auth/session";
import { getProgramBySlug } from "@/lib/data/programs";
import { getTrainersByProgramSlug } from "@/lib/data/trainers";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { StudentTrainerCard } from "@/components/portal/student-trainer-card";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";

export default async function StudentTrainerPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug;
  if (!programSlug) {
    return (
      <EmptyState
        title="Course not assigned"
        description="Your course category is not set yet. Contact admin after approval."
      />
    );
  }

  const program = getProgramBySlug(programSlug);
  const trainers = getTrainersByProgramSlug(programSlug);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Student Portal"
        title="My Trainer"
        description={`Trainers for ${program?.title ?? "your course"}. You only see trainers from your program.`}
      >
        <ProgramCategoryBadge programSlug={programSlug} />
      </PortalPageHeader>

      <div className="mb-8">
        <StudentTrainerCard programSlug={programSlug} trainerId={user.trainerId} />
      </div>

      {trainers.length > 1 && (
        <>
          <h2 className="text-lg font-bold mb-4">All {program?.title ?? "Program"} Trainers</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {trainers
              .filter((trainer) => trainer.id !== user.trainerId)
              .map((trainer) => (
                <div
                  key={trainer.id}
                  className="rounded-2xl border border-border bg-background p-5 shadow-sm"
                >
                  <p className="font-bold text-lg">{trainer.name}</p>
                  <p className="text-sm text-primary">{trainer.designation}</p>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{trainer.bio}</p>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
