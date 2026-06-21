import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import type { User, UserRole } from "@/types/portal";

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany();
  return users.map(mapUser);
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? mapUser(user) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return user ? mapUser(user) : null;
}

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: { role, isActive: true },
  });
  return users.map(mapUser);
}

export async function createUser(
  data: Omit<User, "id" | "passwordHash" | "createdAt"> & { password: string; id?: string }
): Promise<User> {
  const { password, id, ...rest } = data;
  return createUserWithPasswordHash({
    ...rest,
    id,
    passwordHash: await hashPassword(password),
  });
}

export async function createUserWithPasswordHash(
  data: Omit<User, "id" | "passwordHash" | "createdAt"> & {
    passwordHash: string;
    id?: string;
  }
): Promise<User> {
  const { passwordHash, id, ...rest } = data;
  const user = await prisma.user.create({
    data: {
      ...rest,
      id: id ?? crypto.randomUUID(),
      email: rest.email.toLowerCase(),
      passwordHash,
    },
  });
  return mapUser(user);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { passwordHash: _ph, createdAt: _ca, id: _id, ...safe } = updates;
    const user = await prisma.user.update({
      where: { id },
      data: safe,
    });
    return mapUser(user);
  } catch {
    return null;
  }
}

export async function updateUserPasswordHash(id: string, passwordHash: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { passwordHash, isActive: true },
  });
}

function mapUser(user: {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone: string | null;
  programSlug: string | null;
  level: string | null;
  batch: string | null;
  trainerId: string | null;
  avatarInitials: string | null;
  avatarUrl: string | null;
  designation: string | null;
  bio: string | null;
  experience: string | null;
  expertise: string[];
  imagePosition: string | null;
  isActive: boolean;
  createdAt: Date;
}): User {
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    name: user.name,
    phone: user.phone ?? undefined,
    programSlug: user.programSlug ?? undefined,
    level: user.level ?? undefined,
    batch: user.batch ?? undefined,
    trainerId: user.trainerId ?? undefined,
    avatarInitials: user.avatarInitials ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    designation: user.designation ?? undefined,
    bio: user.bio ?? undefined,
    experience: user.experience ?? undefined,
    expertise: user.expertise.length > 0 ? user.expertise : undefined,
    imagePosition: user.imagePosition ?? undefined,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}
