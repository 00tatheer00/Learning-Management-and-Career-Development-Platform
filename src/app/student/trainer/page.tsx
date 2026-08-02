import { getCurrentUser } from "@/lib/auth/session";
import { getProgramBySlug } from "@/lib/data/programs";
import { getTrainersByProgramSlug } from "@/lib/data/trainers";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { StudentTrainerCard } from "@/components/portal/student-trainer-card";
import { ProgramCategoryBadge } from "@/components/portal/program-category-badge";
import { getStudentPortalProgramSlugs } from "@/lib/student-portal/program-scope";

export default async function StudentTrainerPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlugs = await getStudentPortalProgramSlugs(user);
  const primaryProgramSlug = user.programSlug ?? programSlugs[0] ?? "web-development";

  if (programSlugs.length === 0) {
    return (
      <EmptyState
        title="Course not assigned"
        description="Your course category is not set yet. Contact admin after approval."
      />
    );
  }

  return (
    <div>
      <PortalPageHeader
        eyebrow="Student Portal"
        title="My Trainers"
        description="Trainers for your enrolled courses. You see trainers from all programs you are enrolled in."
      >
        <ProgramCategoryBadge programSlug={primaryProgramSlug} />
      </PortalPageHeader>

      <div className="mb-8">
        <StudentTrainerCard programSlug={primaryProgramSlug} trainerId={user.trainerId} />
      </div>

      {programSlugs.map((programSlug) => {
        const program = getProgramBySlug(programSlug);
        const trainers = getTrainersByProgramSlug(programSlug);

        if (trainers.length === 0) return null;

        // For the primary program, only show other trainers (primary is shown above)
        const displayTrainers =
          programSlug === primaryProgramSlug
            ? trainers.filter((trainer) => trainer.id !== user.trainerId)
            : trainers;

        if (displayTrainers.length === 0) return null;

        return (
          <div key={programSlug} className="mb-8">
            <h2 className="text-lg font-bold mb-4">
              {programSlug === primaryProgramSlug ? "Other" : ""} {program?.title ?? "Program"} Trainers
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {displayTrainers.map((trainer) => (
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
          </div>
        );
      })}
    </div>
  );
}
