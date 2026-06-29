"use client";

import { useState } from "react";
import { CaretLeft, CaretRight, BookOpen, ListBullets } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { formatModuleSchedule } from "@/lib/data/programs";
import type { Program, ProgramModule } from "@/types";

type SyllabusView = "modules" | "topics";

interface CourseModulesSyllabusProps {
  program: Program;
  activeModuleName?: string;
  /** When true, show program title header (admin multi-course view) */
  showProgramHeader?: boolean;
  className?: string;
}

export function CourseModulesSyllabus({
  program,
  activeModuleName,
  showProgramHeader = false,
  className,
}: CourseModulesSyllabusProps) {
  const [view, setView] = useState<SyllabusView>("modules");
  const [selectedModule, setSelectedModule] = useState<ProgramModule | null>(null);

  const modules = program.modules.filter((mod) => (mod.topics?.length ?? 0) > 0);

  if (modules.length === 0) return null;

  const openModule = (mod: ProgramModule) => {
    setSelectedModule(mod);
    setView("topics");
  };

  const backToModules = () => {
    setView("modules");
    setSelectedModule(null);
  };

  if (view === "topics" && selectedModule) {
    const moduleIndex = program.modules.findIndex((mod) => mod.name === selectedModule.name);
    const topics = selectedModule.topics ?? [];
    const isActive = activeModuleName === selectedModule.name;

    return (
      <div className={cn("space-y-4", className)}>
        <button
          type="button"
          onClick={backToModules}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <CaretLeft size={16} />
          Back to modules
        </button>

        <div
          className={cn(
            "rounded-2xl border p-5 sm:p-6",
            isActive
              ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
              : "border-border bg-background"
          )}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Module {moduleIndex + 1}
          </p>
          <h3 className="mt-1 text-xl font-bold">{selectedModule.name}</h3>
          {selectedModule.subtitle && (
            <p className="mt-2 text-sm text-muted">{selectedModule.subtitle}</p>
          )}
          <p className="mt-3 text-sm font-medium text-muted">
            {topics.length} topics · {selectedModule.duration}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border bg-surface/50 px-5 py-3">
            <ListBullets size={18} weight="duotone" className="text-primary" />
            <p className="text-sm font-semibold">What you will learn</p>
          </div>
          <ol className="divide-y divide-border">
            {topics.map((topic, index) => (
              <li key={topic} className="flex gap-4 px-5 py-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed pt-0.5">{topic}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showProgramHeader && (
        <div className="rounded-2xl border border-border bg-surface/50 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen size={22} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{program.title}</h3>
              <p className="text-sm text-muted">
                {modules.length} modules · Click a module to see all topics
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modules.map((mod, index) => {
          const isActive = activeModuleName === mod.name;
          const topicCount = mod.topics?.length ?? 0;

          return (
            <button
              key={mod.name}
              type="button"
              onClick={() => openModule(mod)}
              className={cn(
                "group rounded-2xl border p-5 text-left transition-all hover:border-primary hover:shadow-md",
                isActive
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    Module {index + 1}
                  </p>
                  <p className="mt-1 font-bold text-lg break-words">{mod.name}</p>
                  {mod.subtitle && (
                    <p className="mt-1.5 text-sm text-muted line-clamp-2">{mod.subtitle}</p>
                  )}
                  <p className="mt-3 text-xs font-medium text-muted leading-relaxed">
                    {topicCount} topics · {mod.duration}
                    <span className="hidden sm:inline"> · {formatModuleSchedule(mod)}</span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted sm:hidden">
                    {formatModuleSchedule(mod)}
                  </p>
                </div>
                <CaretRight
                  size={20}
                  className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>
              {isActive && (
                <span className="mt-3 inline-block rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                  Your current module
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Browse multiple programs: course → modules → topics */
interface CourseSyllabusBrowserProps {
  programs: Program[];
}

export function CourseSyllabusBrowser({ programs }: CourseSyllabusBrowserProps) {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const syllabusPrograms = programs.filter((p) =>
    p.modules.some((mod) => (mod.topics?.length ?? 0) > 0)
  );

  if (selectedProgram) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedProgram(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <CaretLeft size={16} />
          Back to all courses
        </button>
        <CourseModulesSyllabus program={selectedProgram} showProgramHeader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {syllabusPrograms.map((program) => {
        const moduleCount = program.modules.filter((mod) => (mod.topics?.length ?? 0) > 0).length;
        const topicCount = program.modules.reduce(
          (sum, mod) => sum + (mod.topics?.length ?? 0),
          0
        );

        return (
          <button
            key={program.id}
            type="button"
            onClick={() => setSelectedProgram(program)}
            className="group rounded-2xl border border-border bg-background p-5 text-left transition-all hover:border-primary hover:shadow-md"
          >
            <p className="font-semibold text-lg group-hover:text-primary transition-colors">
              {program.title}
            </p>
            <p className="text-xs text-muted mt-1 capitalize">
              {program.category === "active" ? "Open" : "Coming Soon"}
            </p>
            <p className="text-sm text-muted mt-2 line-clamp-2">{program.description}</p>
            <p className="mt-3 text-xs font-semibold text-primary">
              {moduleCount} modules · {topicCount} topics
            </p>
          </button>
        );
      })}
      {syllabusPrograms.length === 0 && (
        <p className="text-sm text-muted col-span-full">No syllabus published yet.</p>
      )}
    </div>
  );
}
