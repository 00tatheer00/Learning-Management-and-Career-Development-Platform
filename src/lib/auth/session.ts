import { cookies } from "next/headers";
import { readJsonFile, writeJsonFile } from "@/lib/db/json-store";
import type { PortalUser, Session, User, UserRole } from "@/types/portal";
import { getUserById, seedUsersIfNeeded } from "@/lib/auth/users";

const SESSION_COOKIE = "eest_session";
const SESSION_FILE = "sessions.json";
const SESSION_DAYS = 7;

export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  const sessions = await readJsonFile<Session[]>(SESSION_FILE, []);
  sessions.push({ id: sessionId, userId, expiresAt: expiresAt.toISOString() });
  await writeJsonFile(SESSION_FILE, sessions);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return sessionId;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    const sessions = await readJsonFile<Session[]>(SESSION_FILE, []);
    await writeJsonFile(
      SESSION_FILE,
      sessions.filter((s) => s.id !== sessionId)
    );
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<PortalUser | null> {
  await seedUsersIfNeeded();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const sessions = await readJsonFile<Session[]>(SESSION_FILE, []);
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    await writeJsonFile(
      SESSION_FILE,
      sessions.filter((s) => s.id !== sessionId)
    );
    return null;
  }

  const user = await getUserById(session.userId);
  if (!user || !user.isActive) return null;

  return toPortalUser(user);
}

export function toPortalUser(user: User): PortalUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    programSlug: user.programSlug,
    level: user.level,
    trainerId: user.trainerId,
  };
}

export function getPortalHome(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "trainer":
      return "/trainer/dashboard";
    default:
      return "/student/dashboard";
  }
}

export function roleGuard(user: PortalUser | null, allowed: UserRole[]): PortalUser {
  if (!user || !allowed.includes(user.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
