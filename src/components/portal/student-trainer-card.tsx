import "server-only";

import Image from "next/image";
import Link from "next/link";
import { ChalkboardTeacher, ArrowRight } from "@phosphor-icons/react/ssr";
import { getDisplayTrainerProfile } from "@/lib/api/admin-trainers";
import { getProgramCategory } from "@/lib/constants/program-categories";
import { cn } from "@/lib/utils";
import type { Trainer } from "@/types";

interface StudentTrainerCardProps {
  programSlug: string;
  trainerId?: string;
  className?: string;
  trainer?: Trainer | null;
}

export async function StudentTrainerCard({
  programSlug,
  trainerId,
  className,
  trainer: preloaded,
}: StudentTrainerCardProps) {
  const category = getProgramCategory(programSlug);
  const assignedTrainer =
    preloaded ?? (await getDisplayTrainerProfile(trainerId, programSlug));

  if (!assignedTrainer || !category) return null;

  return (
    <div className={cn("portal-card rounded-2xl overflow-hidden h-full", className)}>
      <div className="student-trainer-card-header flex items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex items-center gap-2 text-primary">
          <ChalkboardTeacher size={20} weight="duotone" />
          <p className="text-sm font-semibold text-pt">Your {category.shortLabel} Trainer</p>
        </div>
        <Link
          href="/student/trainer"
          className="text-xs font-medium text-pt-muted hover:text-primary inline-flex items-center gap-1 transition-colors"
        >
          Profile
          <ArrowRight size={12} weight="bold" />
        </Link>
      </div>

      <div className="flex items-start gap-4 p-5">
        {assignedTrainer.image ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-pt ring-2 ring-primary/10">
            <Image
              src={assignedTrainer.image}
              alt={assignedTrainer.name}
              fill
              className="object-cover"
              style={{ objectPosition: assignedTrainer.imagePosition ?? "center" }}
              sizes="56px"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary border border-primary/20">
            {assignedTrainer.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-pt tracking-tight">{assignedTrainer.name}</p>
          <p className="text-sm text-primary font-medium">{assignedTrainer.designation}</p>
          <p className="mt-2 text-sm text-pt-muted leading-relaxed line-clamp-2">
            {assignedTrainer.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
