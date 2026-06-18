import Link from "next/link";
import {
  BookOpen,
  VideoCamera,
  ClipboardText,
  ChatsCircle,
} from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssignments, getLiveSessions, getMaterials } from "@/lib/api/portal-data";
import { getProgramBySlug } from "@/lib/data/programs";
import { PortalPageHeader, StatCard, QuickActionCard } from "@/components/portal/portal-ui";
import { Button } from "@/components/ui/button";
import { HELP_CONFIG } from "@/lib/constants/help";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const programSlug = user.programSlug ?? "web-development";
  const [materials, assignments, sessions] = await Promise.all([
    getMaterials(programSlug),
    getAssignments(programSlug),
    getLiveSessions(programSlug),
  ]);
  const program = getProgramBySlug(programSlug);
  const nextSession = sessions.find(
    (s) => s.date >= new Date().toISOString().split("T")[0]
  );

  return (
    <div>
      <PortalPageHeader
        title={`Welcome, ${user.name.split(" ")[0]}!`}
        description={`You are enrolled in ${program?.title ?? "your course"}. Everything you need is right here.`}
      >
        <Button size="lg" asChild>
          <Link href="/student/classes">Join Live Class</Link>
        </Button>
      </PortalPageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Video Lessons" value={materials.length} accent="orange" />
        <StatCard label="Assignments" value={assignments.length} accent="blue" />
        <StatCard label="Live Classes" value={sessions.length} accent="green" />
        <StatCard label="Your Level" value={user.level ?? "—"} accent="slate" />
      </div>

      {nextSession && (
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6 mb-8">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
            Next Live Class
          </p>
          <h2 className="text-xl font-bold mb-1">{nextSession.title}</h2>
          <p className="text-muted mb-4">
            {nextSession.date} at {nextSession.time} · {nextSession.trainerName}
          </p>
          <Button size="lg" asChild>
            <a href={nextSession.meetLink} target="_blank" rel="noopener noreferrer">
              <VideoCamera size={20} weight="duotone" />
              Join Class Now
            </a>
          </Button>
        </div>
      )}

      <h2 className="text-lg font-bold mb-4">Quick Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickActionCard
          href="/student/course"
          title="Watch Lessons"
          description="Open your course videos and materials"
          icon={<BookOpen size={24} weight="duotone" />}
        />
        <QuickActionCard
          href="/student/assignments"
          title="Submit Homework"
          description="See and submit your assignments"
          icon={<ClipboardText size={24} weight="duotone" />}
          color="bg-blue-500/10 text-blue-600"
        />
        <QuickActionCard
          href="/student/whatsapp"
          title="WhatsApp Group"
          description="Chat with your class and trainer"
          icon={<ChatsCircle size={24} weight="duotone" />}
          color="bg-emerald-500/10 text-emerald-600"
        />
        <QuickActionCard
          href={HELP_CONFIG.whatsappUrl}
          title="Need Help?"
          description="Message us on WhatsApp anytime"
          icon={<ChatsCircle size={24} weight="fill" />}
          color="bg-[#25D366]/10 text-[#25D366]"
        />
      </div>
    </div>
  );
}
