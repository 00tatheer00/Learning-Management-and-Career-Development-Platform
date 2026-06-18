import { readJsonFile, writeJsonFile } from "@/lib/db/json-store";
import { hashPassword } from "@/lib/auth/password";
import type { User, UserRole } from "@/types/portal";

const USERS_FILE = "users.json";

const DEFAULT_USERS: Array<Omit<User, "passwordHash"> & { password: string }> = [
  {
    id: "admin-1",
    email: "admin@eest.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
    phone: "03275792600",
    isActive: true,
    createdAt: new Date().toISOString(),
    avatarInitials: "AU",
  },
  {
    id: "trainer-1",
    email: "trainer@eest.com",
    password: "trainer123",
    role: "trainer",
    name: "Syed Tatheer Hussain",
    phone: "03275792600",
    trainerId: "trainer-1",
    isActive: true,
    createdAt: new Date().toISOString(),
    avatarInitials: "ST",
  },
  {
    id: "student-1",
    email: "student@eest.com",
    password: "student123",
    role: "student",
    name: "Demo Student",
    phone: "03001234567",
    programSlug: "web-development",
    level: "Foundations",
    isActive: true,
    createdAt: new Date().toISOString(),
    avatarInitials: "DS",
  },
];

let seeded = false;

export async function seedUsersIfNeeded(): Promise<void> {
  if (seeded) return;
  const users = await readJsonFile<User[]>(USERS_FILE, []);
  if (users.length === 0) {
    const hashed: User[] = [];
    for (const u of DEFAULT_USERS) {
      const { password, ...rest } = u;
      hashed.push({ ...rest, passwordHash: await hashPassword(password) });
    }
    await writeJsonFile(USERS_FILE, hashed);
  }
  seeded = true;
}

export async function getUsers(): Promise<User[]> {
  await seedUsersIfNeeded();
  return readJsonFile<User[]>(USERS_FILE, []);
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const users = await getUsers();
  return users.filter((u) => u.role === role && u.isActive);
}

export async function createUser(
  data: Omit<User, "id" | "passwordHash" | "createdAt"> & { password: string }
): Promise<User> {
  const users = await getUsers();
  const { password, ...rest } = data;
  const user: User = {
    ...rest,
    id: crypto.randomUUID(),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeJsonFile(USERS_FILE, users);
  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  await writeJsonFile(USERS_FILE, users);
  return users[index];
}
