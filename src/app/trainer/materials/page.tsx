import { getCurrentUser } from "@/lib/auth/session";
import { getTrainerCourseTitle } from "@/lib/auth/trainer-scope";
import { getMaterials } from "@/lib/api/portal-data";
import { PortalPageHeader, EmptyState } from "@/components/portal/portal-ui";
import { PlayCircle, LinkSimple } from "@phosphor-icons/react/ssr";

export default async function TrainerMaterialsPage() {
  const user = await getCurrentUser();
  if (!user?.programSlug) {
    return <EmptyState title="No course assigned" description="Contact admin to link your trainer account to a course." />;
  }

  const materials = await getMaterials(user.programSlug);
  const courseTitle = getTrainerCourseTitle(user.programSlug);

  return (
    <div>
      <PortalPageHeader
        eyebrow="Trainer Portal"
        title="Course Videos & Materials"
        description={`Learning content for ${courseTitle}. Contact admin to add new materials.`}
      />

      {materials.length === 0 ? (
        <EmptyState title="No materials yet" description="Course videos and links will appear here." />
      ) : (
        <div className="space-y-4">
          {materials.map((m) => (
            <a
              key={m.id}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-border bg-background p-5 hover:border-primary/30 transition-all"
            >
              {m.type === "video" ? (
                <PlayCircle size={28} weight="duotone" className="text-primary shrink-0" />
              ) : (
                <LinkSimple size={28} weight="duotone" className="text-primary shrink-0" />
              )}
              <div>
                <p className="font-semibold">{m.title}</p>
                <p className="text-sm text-muted">{courseTitle} · {m.description}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
