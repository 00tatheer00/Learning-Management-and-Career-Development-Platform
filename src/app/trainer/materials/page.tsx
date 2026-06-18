import { PlayCircle, LinkSimple } from "@phosphor-icons/react/ssr";
import { getMaterials } from "@/lib/api/portal-data";
import { PortalPageHeader } from "@/components/portal/portal-ui";

export default async function TrainerMaterialsPage() {
  const materials = await getMaterials();

  return (
    <div>
      <PortalPageHeader
        title="Course Videos & Materials"
        description="Learning content available to students. Contact admin to add new materials."
      />

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
              <p className="text-sm text-muted">{m.programSlug} · {m.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
