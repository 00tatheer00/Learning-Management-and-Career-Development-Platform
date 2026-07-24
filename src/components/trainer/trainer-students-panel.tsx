"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Phone,
  Envelope,
  MagnifyingGlass,
  Users,
  BookOpen,
  Clock,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { getProgramCategory } from "@/lib/constants/program-categories";
import {
  getRegistrationPhase,
  getPhaseInfo,
  type RegistrationPhase,
} from "@/lib/constants/batch";
import {
  groupStudentsByModule,
  getModuleFilterOptions,
} from "@/lib/trainer/group-students-by-module";
import { cn } from "@/lib/utils";

export interface TrainerStudentRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  level?: string;
  batch?: string;
}

interface TrainerStudentsPanelProps {
  students: TrainerStudentRow[];
  programSlug: string;
  courseTitle: string;
  designation: string;
}

export function TrainerStudentsPanel({
  students,
  programSlug,
  courseTitle,
  designation,
}: TrainerStudentsPanelProps) {
  const searchParams = useSearchParams();
  const initialModule = searchParams.get("module");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<"all" | RegistrationPhase>("all");
  const [search, setSearch] = useState("");

  const category = getProgramCategory(programSlug);
  const accentBorder = category?.slug === "app-development" ? "border-indigo-200" : "border-orange-200";
  const accentBg = category?.slug === "app-development" ? "bg-indigo-50" : "bg-orange-50";
  const accentText = category?.slug === "app-development" ? "text-indigo-700" : "text-orange-700";
  const accentValue = category?.slug === "app-development" ? "text-indigo-950" : "text-orange-950";

  const moduleGroups = useMemo(
    () => groupStudentsByModule(students, programSlug),
    [students, programSlug]
  );
  const moduleOptions = useMemo(() => getModuleFilterOptions(moduleGroups), [moduleGroups]);

  useEffect(() => {
    if (!initialModule) return;
    const match = moduleOptions.find((mod) => mod.name === initialModule);
    if (match) setModuleFilter(match.name);
  }, [initialModule, moduleOptions]);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    let groups = moduleGroups;

    if (moduleFilter !== "all") {
      groups = groups.filter((group) => group.moduleName === moduleFilter);
    }

    if (phaseFilter !== "all") {
      groups = groups
        .map((group) => ({
          ...group,
          students: group.students.filter(
            (student) => getRegistrationPhase(student) === phaseFilter
          ),
        }))
        .filter((group) => group.students.length > 0);
    }

    if (!query) return groups;

    return groups
      .map((group) => ({
        ...group,
        students: group.students.filter((student) =>
          [student.name, student.email, student.phone, student.level, student.batch]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query)
        ),
      }))
      .filter((group) => group.students.length > 0);
  }, [moduleGroups, moduleFilter, phaseFilter, search]);

  const visibleCount = filteredGroups.reduce((sum, group) => sum + group.students.length, 0);

  if (students.length === 0) {
    return (
      <div>
        <PortalPageHeader
          title="My Students"
          description={`Students enrolled in ${courseTitle} (${designation}).`}
        />
        <EmptyState
          title="No students yet"
          description="Students appear here after admin approves their registration for your course."
        />
      </div>
    );
  }

  return (
    <div>
      <PortalPageHeader
        title="My Students"
        description={`${courseTitle} · ${designation}. Browse by module to see who is in each stage.`}
      />

      {/* Summary — Web (4 modules) & App (3 modules) from course catalog */}
      <div
        className={cn(
          "mb-6 grid gap-3",
          moduleOptions.length <= 3
            ? "grid-cols-2 sm:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        )}
      >
        <div
          className={cn(
            "rounded-2xl border-2 p-4 col-span-2 sm:col-span-1",
            accentBorder,
            accentBg
          )}
        >
          <div className={cn("flex items-center gap-2 mb-1", accentText)}>
            <Users size={18} weight="duotone" />
            <p className="text-xs font-bold uppercase tracking-wide">Total</p>
          </div>
          <p className={cn("text-3xl font-bold", accentValue)}>{students.length}</p>
          <p className={cn("text-xs mt-0.5 opacity-80", accentText)}>
            {category?.shortLabel ?? "Course"} · active students
          </p>
        </div>
        {moduleOptions.map((mod) => (
          <button
            key={mod.name}
            type="button"
            onClick={() => setModuleFilter(mod.name === moduleFilter ? "all" : mod.name)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all hover:shadow-md",
              moduleFilter === mod.name
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-background hover:border-primary/30"
            )}
          >
            <p className="text-xs font-semibold text-muted truncate">{mod.name}</p>
            <p className="text-2xl font-bold mt-0.5">{mod.count}</p>
          </button>
        ))}
      </div>

      {/* Phase Segment Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-border/60 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted mr-1">
          Phase:
        </span>
        {[
          { id: "all", label: "All Phases" },
          { id: "phase-1", label: "Phase 1 (Module 1)" },
          { id: "phase-2", label: "Phase 2 (2nd Module)" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPhaseFilter(item.id as "all" | RegistrationPhase)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all",
              phaseFilter === item.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "border border-border bg-background text-muted hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModuleFilter("all")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              moduleFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted hover:text-foreground"
            )}
          >
            All modules ({students.length})
          </button>
          {moduleOptions.map((mod) => (
            <button
              key={mod.name}
              type="button"
              onClick={() => setModuleFilter(mod.name)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                moduleFilter === mod.name
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-muted hover:text-foreground"
              )}
            >
              {mod.name} ({mod.count})
            </button>
          ))}
        </div>
      </div>

      {visibleCount === 0 ? (
        <EmptyState
          title="No matches"
          description="Try a different search or module filter."
        />
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <section key={group.moduleName}>
              <div
                className={cn(
                  "rounded-2xl overflow-hidden border border-border shadow-sm mb-4",
                  category?.headerGradient
                    ? `bg-gradient-to-r ${category.headerGradient} text-white`
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                )}
              >
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                      <BookOpen size={22} weight="duotone" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{group.moduleName}</h2>
                      {group.subtitle && (
                        <p className="text-sm text-white/85 mt-0.5">{group.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    {group.duration && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                        <Clock size={14} />
                        {group.duration}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-bold">
                      <Users size={16} weight="duotone" />
                      {group.students.length} student{group.students.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.students.map((student) => (
                  <article
                    key={student.id}
                    className="rounded-2xl border border-border bg-background p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{student.name}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-muted truncate">{courseTitle}</p>
                          {(() => {
                            const phase = getRegistrationPhase(student);
                            const info = getPhaseInfo(phase);
                            return (
                              <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold", info.badgeClass)}>
                                {info.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <p className="flex items-center gap-2 text-muted">
                        <GraduationCap size={16} weight="duotone" className="text-primary shrink-0" />
                        <span>
                          {student.batch ? `${student.batch} · ` : ""}
                          {student.level ?? group.moduleName}
                        </span>
                      </p>
                      <a
                        href={`mailto:${student.email}`}
                        className="flex items-center gap-2 text-muted hover:text-primary transition-colors truncate"
                      >
                        <Envelope size={16} weight="duotone" className="shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </a>
                      {student.phone && (
                        <a
                          href={`https://wa.me/${student.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted hover:text-emerald-600 transition-colors"
                        >
                          <Phone size={16} weight="duotone" className="shrink-0" />
                          {student.phone}
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
