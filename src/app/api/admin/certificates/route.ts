import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { getEligibleStudentsForModule } from "@/lib/certificates/certificate-service";
import { programs } from "@/lib/data/programs";

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();

  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("program") ?? "web-development";
  const firstModule = programs.find((p) => p.slug === programSlug)?.modules[0]?.name ?? "HTML & CSS";
  const moduleName = searchParams.get("module") ?? firstModule;

  try {
    const data = await getEligibleStudentsForModule(programSlug, moduleName);
    return NextResponse.json(createApiResponse(true, { data }));
  } catch (error) {
    console.error("Failed to fetch admin certificate stats:", error);
    return NextResponse.json(
      createApiResponse(false, { error: "Failed to fetch certificate statistics" }),
      { status: 500 }
    );
  }
}
