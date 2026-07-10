import { NextResponse } from "next/server";
import { getAdminUser, unauthorizedAdminResponse } from "@/lib/auth/admin-access";
import { createApiResponse } from "@/lib/api/enrollment";
import { listWhatsAppConversations } from "@/lib/api/whatsapp-crm";

export async function GET(request: Request) {
  const user = await getAdminUser(request);
  if (!user) return unauthorizedAdminResponse();

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") ?? "open") as "open" | "archived" | "blocked" | "all";
  const search = searchParams.get("search") ?? undefined;

  const conversations = await listWhatsAppConversations({ status, search });
  return NextResponse.json(createApiResponse(true, { data: conversations }));
}
