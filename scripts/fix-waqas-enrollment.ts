import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function fixWaqas() {
  console.log("Searching for Waqas Ahmad enrollments...");
  
  const enrollments = await prisma.enrollment.findMany({
    where: {
      email: {
        contains: "waqqas",
        mode: "insensitive",
      },
    },
  });

  console.log(`Found ${enrollments.length} enrollments for Waqas:`);
  for (const e of enrollments) {
    console.log(`- ID: ${e.id} | Program: ${e.program} | Level: ${e.level} | Status: ${e.status} | CreatedAt: ${e.createdAt}`);
  }

  const frontendEnrollment = enrollments.find(
    (e) => e.level.toLowerCase().includes("frontend") || e.level.toLowerCase().includes("flutter frontend")
  );

  if (frontendEnrollment) {
    console.log(`\nApproving enrollment ${frontendEnrollment.id} for level "${frontendEnrollment.level}"...`);
    const updated = await prisma.enrollment.update({
      where: { id: frontendEnrollment.id },
      data: {
        status: "approved",
        reviewedAt: new Date(),
        adminNotes: "Approved - Module 2 unlock fix",
      },
    });
    console.log("Updated enrollment status to approved:", updated.status);

    const user = await prisma.user.findFirst({
      where: {
        email: { equals: updated.email.trim().toLowerCase(), mode: "insensitive" },
      },
    });

    if (user) {
      console.log(`Updating User account ${user.id} (${user.email}) active level to Flutter Frontend...`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          level: "Flutter Frontend",
          programSlug: "app-development",
        },
      });

      const id = `mod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      await prisma.moduleEnrollment.upsert({
        where: {
          email_programSlug_moduleName: {
            email: user.email.trim().toLowerCase(),
            programSlug: "app-development",
            moduleName: "Flutter Frontend",
          },
        },
        create: {
          id,
          email: user.email.trim().toLowerCase(),
          programSlug: "app-development",
          moduleName: "Flutter Frontend",
          studentId: user.id,
          enrollmentId: updated.id,
          status: "active",
        },
        update: {
          studentId: user.id,
          enrollmentId: updated.id,
          status: "active",
        },
      });
      console.log("ModuleEnrollment recorded successfully!");
    } else {
      console.log("User account not found for Waqas.");
    }
  } else {
    console.log("No Flutter Frontend enrollment record found for Waqas.");
  }

  console.log("\nFix completed successfully!");
}

fixWaqas()
  .catch((e) => {
    console.error("Error running script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
