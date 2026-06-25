import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { getDatabaseUrl } from "../src/lib/database-url";

const prisma = new PrismaClient({
  datasources: { db: { url: getDatabaseUrl() } },
});

const DEFAULT_USERS = [
  {
    id: "admin-1",
    email: "admin@eest.com",
    password: "admin@321",
    role: "admin" as const,
    name: "Tatheer Hussain",
    phone: "03374005515",
    avatarInitials: "AU",
  },
  {
    id: "trainer-tatheer",
    email: "tatheer@eest.com",
    password: "tatheer@321",
    role: "trainer" as const,
    name: "S Tatheer Hussain",
    phone: "03374005515",
    programSlug: "web-development",
    trainerId: "trainer-tatheer",
    avatarInitials: "ST",
  },
  {
    id: "trainer-talha",
    email: "talha@eest.com",
    password: "talha@321",
    role: "trainer" as const,
    name: "Talha Iqbal",
    phone: "03001234567",
    programSlug: "app-development",
    trainerId: "trainer-talha",
    avatarInitials: "TI",
  },
  {
    id: "student-1",
    email: "student@eest.com",
    password: "student123",
    role: "student" as const,
    name: "Demo Student",
    phone: "03001234567",
    programSlug: "web-development",
    level: "HTML & CSS",
    batch: "Batch 1",
    avatarInitials: "DS",
  },
];

const DEFAULT_MATERIALS: Array<{
  id: string;
  programSlug: string;
  title: string;
  description: string;
  type: "video" | "link" | "document";
  url: string;
  order: number;
}> = [];

const DEFAULT_ASSIGNMENTS: Array<{
  id: string;
  programSlug: string;
  title: string;
  description: string;
  dueDate: string;
  trainerId: string;
}> = [];

const DEFAULT_SESSIONS: Array<{
  id: string;
  programSlug: string;
  title: string;
  date: string;
  time: string;
  meetLink: string;
  trainerId: string;
  trainerName: string;
  notes?: string;
}> = [];

async function upsertUser(user: (typeof DEFAULT_USERS)[number]) {
  const { password, ...rest } = user;
  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email: rest.email.toLowerCase() },
    create: {
      ...rest,
      email: rest.email.toLowerCase(),
      passwordHash,
      isActive: true,
    },
    update: {
      name: rest.name,
      phone: rest.phone,
      programSlug: rest.programSlug,
      level: rest.level,
      trainerId: rest.trainerId,
      avatarInitials: rest.avatarInitials,
      role: rest.role,
      passwordHash,
      isActive: true,
    },
  });
}

async function main() {
  for (const user of DEFAULT_USERS) {
    await upsertUser(user);
  }

  await prisma.assignmentSubmission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.courseMaterial.deleteMany({});
  await prisma.liveSession.deleteMany({});

  for (const material of DEFAULT_MATERIALS) {
    await prisma.courseMaterial.upsert({
      where: { id: material.id },
      create: material,
      update: {
        programSlug: material.programSlug,
        title: material.title,
        description: material.description,
        type: material.type,
        url: material.url,
        order: material.order,
      },
    });
  }

  for (const assignment of DEFAULT_ASSIGNMENTS) {
    await prisma.assignment.upsert({
      where: { id: assignment.id },
      create: assignment,
      update: {
        programSlug: assignment.programSlug,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        trainerId: assignment.trainerId,
      },
    });
  }

  for (const session of DEFAULT_SESSIONS) {
    await prisma.liveSession.upsert({
      where: { id: session.id },
      create: session,
      update: {
        programSlug: session.programSlug,
        title: session.title,
        date: session.date,
        time: session.time,
        meetLink: session.meetLink,
        trainerId: session.trainerId,
        trainerName: session.trainerName,
        notes: session.notes,
      },
    });
  }

  console.log("Seed complete: users upserted; course content cleared.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
