import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import { canAdminWrite, isAdminRole } from "@/lib/auth/admin-roles";
import type { PortalUser } from "@/types/portal";

export { canAdminWrite, isAdminRole } from "@/lib/auth/admin-roles";

export async function getAdminUser(): Promise<PortalUser | null> {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) return null;
  return user;
}

export function unauthorizedAdminResponse() {
  return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
    status: 403,
  });
}

export function readOnlyAdminResponse() {
  return NextResponse.json(
    createApiResponse(false, {
      error: "Read-only access",
      message: "View only — contact Tatheer to make changes.",
    }),
    { status: 403 }
  );
}

export async function requireAdminRead(): Promise<PortalUser | NextResponse> {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();
  return user;
}

export async function requireAdminWrite(): Promise<PortalUser | NextResponse> {
  const user = await getAdminUser();
  if (!user) return unauthorizedAdminResponse();
  if (!canAdminWrite(user.role)) return readOnlyAdminResponse();
  return user;
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
