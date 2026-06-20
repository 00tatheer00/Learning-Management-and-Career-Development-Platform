import Image from "next/image";
import { ChalkboardTeacher } from "@phosphor-icons/react/ssr";
import { getTrainersByProgramSlug } from "@/lib/data/trainers";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { cn } from "@/lib/utils";

interface StudentTrainerCardProps {
  programSlug: string;
  trainerId?: string;
  className?: string;
}

export function StudentTrainerCard({
  programSlug,
  trainerId,
  className,
}: StudentTrainerCardProps) {
  const category = getProgramCategory(programSlug);
  const trainers = getTrainersByProgramSlug(programSlug);
  const assignedTrainer =
    (trainerId ? trainers.find((trainer) => trainer.id === trainerId) : undefined) ??
    trainers.find((trainer) => trainer.featured) ??
    trainers[0];

  if (!assignedTrainer || !category) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background overflow-hidden shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 px-5 py-3 text-white bg-gradient-to-r",
          category.headerGradient
        )}
      >
        <ChalkboardTeacher size={20} weight="duotone" />
        <p className="text-sm font-semibold">Your {category.shortLabel} Trainer</p>
      </div>

      <div className="flex items-start gap-4 p-5">
        {assignedTrainer.image ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border">
            <Image
              src={assignedTrainer.image}
              alt={assignedTrainer.name}
              fill
              className="object-cover"
              style={{ objectPosition: assignedTrainer.imagePosition ?? "center" }}
              sizes="64px"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {assignedTrainer.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-foreground">{assignedTrainer.name}</p>
          <p className="text-sm text-primary font-medium">{assignedTrainer.designation}</p>
          {assignedTrainer.experience && (
            <p className="mt-1 text-xs text-muted">{assignedTrainer.experience} experience</p>
          )}
          <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-2">
            {assignedTrainer.bio}
          </p>
          {assignedTrainer.expertise.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {assignedTrainer.expertise.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
