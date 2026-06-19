import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

const DEFAULT_USERS = [
  {
    id: "admin-1",
    email: "admin@eest.com",
    password: "admin@321",
    role: "admin" as const,
    name: "Admin User",
    phone: "03275792600",
    avatarInitials: "AU",
  },
  {
    id: "trainer-tatheer",
    email: "tatheer@eest.com",
    password: "tatheer@321",
    role: "trainer" as const,
    name: "S Tatheer Hussain",
    phone: "03275792600",
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

const DEFAULT_MATERIALS = [
  {
    id: "mat-1",
    programSlug: "web-development",
    title: "HTML & CSS Basics",
    description: "Introduction to building web pages",
    type: "video" as const,
    url: "https://www.youtube.com/watch?v=qz0aGYrrlhU",
    order: 1,
  },
  {
    id: "mat-2",
    programSlug: "web-development",
    title: "JavaScript Fundamentals",
    description: "Learn JS from scratch",
    type: "video" as const,
    url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
    order: 2,
  },
  {
    id: "mat-3",
    programSlug: "web-development",
    title: "Practice Exercises",
    description: "Download and practice",
    type: "link" as const,
    url: "https://www.w3schools.com/html/html_exercises.asp",
    order: 3,
  },
  {
    id: "mat-4",
    programSlug: "app-development",
    title: "Flutter Introduction",
    description: "Start mobile app development",
    type: "video" as const,
    url: "https://www.youtube.com/watch?v=1ukSR1GRtMU",
    order: 1,
  },
];

const DEFAULT_ASSIGNMENTS = [
  {
    id: "asg-1",
    programSlug: "web-development",
    title: "Build Your First Web Page",
    description: "Create a simple personal portfolio page using HTML and CSS.",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    trainerId: "trainer-tatheer",
  },
  {
    id: "asg-2",
    programSlug: "web-development",
    title: "JavaScript Calculator",
    description: "Make a basic calculator using JavaScript.",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    trainerId: "trainer-tatheer",
  },
];

const DEFAULT_SESSIONS = [
  {
    id: "ses-1",
    programSlug: "web-development",
    title: "Live Class — HTML & CSS",
    date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    time: "07:00 PM",
    meetLink: "https://meet.google.com/eest-web-dev",
    trainerId: "trainer-tatheer",
    trainerName: "S Tatheer Hussain",
    notes: "Join 5 minutes early. Keep your mic muted.",
  },
  {
    id: "ses-2",
    programSlug: "app-development",
    title: "Live Class — Flutter Setup",
    date: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
    time: "07:00 PM",
    meetLink: "https://meet.google.com/eest-flutter",
    trainerId: "trainer-talha",
    trainerName: "Talha Iqbal",
  },
];

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

  console.log("Seed complete: users, materials, assignments, and sessions upserted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
