import Link from "next/link";
import { PlayCircle, LinkSimple, FileText } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getMaterials } from "@/lib/api/portal-data";
import { getProgramBySlug } from "@/lib/data/programs";
import { ProgramModuleTimeline } from "@/components/shared/program-module-timeline";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";

const typeIcons = {
  video: PlayCircle,
  link: LinkSimple,
  document: FileText,
};

export default async function StudentCoursePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const materials = await getMaterials(programSlug);
  const program = getProgramBySlug(programSlug);

  return (
    <div>
      <PortalPageHeader
        title="My Course"
        description={`${program?.title ?? "Your course"} — your modules and lessons`}
      />

      {program && program.modules.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-1">Your Program Modules</h2>
          <p className="text-sm text-muted mb-5">
            You are currently on: <strong className="text-foreground">{user.level ?? "—"}</strong>
          </p>
          <ProgramModuleTimeline modules={program.modules} activeModuleName={user.level ?? undefined} />
        </div>
      )}

      <h2 className="text-lg font-bold mb-4">Lessons &amp; Materials</h2>

      {materials.length === 0 ? (
        <EmptyState
          title="No lessons yet"
          description="Your trainer will add videos soon. Check WhatsApp for updates."
          action={
            <Button asChild>
              <Link href="/student/whatsapp">Open WhatsApp Group</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {materials.map((material, index) => {
            const Icon = typeIcons[material.type];
            return (
              <a
                key={material.id}
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-border bg-background p-5 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={18} weight="duotone" className="text-primary" />
                    <span className="text-xs font-semibold uppercase text-muted">
                      {material.type === "video" ? "Video Lesson" : material.type === "link" ? "Practice Link" : "Document"}
                    </span>
                  </div>
                  <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {material.title}
                  </p>
                  <p className="text-sm text-muted mt-0.5">{material.description}</p>
                </div>
                <span className="text-primary font-semibold text-sm shrink-0">Open →</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
