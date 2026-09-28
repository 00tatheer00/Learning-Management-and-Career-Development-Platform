import { PrismaClient } from "@prisma/client";
import { getApprovedEnrollmentLevels } from "../src/lib/auth/student-module-sync";
import { getApprovedProgramSlugs } from "../src/lib/student-portal/program-scope";
import { getAdminStudentRows } from "../src/lib/api/admin-students";

const prisma = new PrismaClient();

async function main() {
  const email = "muhummadsaqibali@gmail.com";
  console.log("=== APPLYING FIX FOR muhummadsaqibali@gmail.com ===");

  // 1. Find the user
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (!user) {
    console.error("User not found!");
    return;
  }

  console.log(`Found user: ${user.id} (${user.email}), current level: ${user.level}, program: ${user.programSlug}`);

  // 2. Update User record to Web Development JavaScript
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      programSlug: "web-development",
      level: "JavaScript",
      trainerId: "trainer-tatheer",
    },
  });
  console.log(`Updated user: programSlug=${updatedUser.programSlug}, level=${updatedUser.level}, trainerId=${updatedUser.trainerId}`);

  // 3. Deactivate Flutter enrollment (acd32d9e-145b-4e6e-9d73-3f42d17f0bcc)
  const flutterEnrollment = await prisma.enrollment.findUnique({
    where: { id: "acd32d9e-145b-4e6e-9d73-3f42d17f0bcc" },
  });

  if (flutterEnrollment) {
    await prisma.enrollment.update({
      where: { id: flutterEnrollment.id },
      data: {
        status: "rejected",
        adminNotes: "Deactivated / closed - student switched to Web Development JavaScript",
      },
    });
    console.log(`Deactivated Flutter enrollment ${flutterEnrollment.id} (status: rejected)`);
  }

  // 4. Ensure Web Development JavaScript enrollment is approved
  const jsEnrollment = await prisma.enrollment.findUnique({
    where: { id: "427d786f-f23a-4d05-a36b-82c3749c0323" },
  });

  if (jsEnrollment) {
    await prisma.enrollment.update({
      where: { id: jsEnrollment.id },
      data: {
        status: "approved",
        program: "web-development",
        level: "JavaScript",
      },
    });
    console.log(`Confirmed Web Development JavaScript enrollment ${jsEnrollment.id} (status: approved)`);
  }

  // 5. Update ModuleEnrollments
  // Inactivate Flutter Dart & OOP
  const flutterModule = await prisma.moduleEnrollment.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      programSlug: "app-development",
      moduleName: "Dart & OOP",
    },
  });
  if (flutterModule) {
    await prisma.moduleEnrollment.update({
      where: { id: flutterModule.id },
      data: { status: "inactive" },
    });
    console.log(`Set Flutter ModuleEnrollment ${flutterModule.id} status to inactive`);
  }

  // Inactivate un-enrolled HTML & CSS backfill
  const htmlModule = await prisma.moduleEnrollment.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      programSlug: "web-development",
      moduleName: "HTML & CSS",
    },
  });
  if (htmlModule) {
    await prisma.moduleEnrollment.update({
      where: { id: htmlModule.id },
      data: { status: "inactive" },
    });
    console.log(`Set HTML & CSS ModuleEnrollment ${htmlModule.id} status to inactive`);
  }

  // Ensure JavaScript ModuleEnrollment is active
  await prisma.moduleEnrollment.upsert({
    where: {
      email_programSlug_moduleName: {
        email: email.trim().toLowerCase(),
        programSlug: "web-development",
        moduleName: "JavaScript",
      },
    },
    create: {
      id: `mod_${Date.now()}_js`,
      studentId: user.id,
      enrollmentId: jsEnrollment?.id ?? null,
      email: email.trim().toLowerCase(),
      programSlug: "web-development",
      moduleName: "JavaScript",
      status: "active",
    },
    update: {
      studentId: user.id,
      enrollmentId: jsEnrollment?.id ?? null,
      status: "active",
    },
  });
  console.log("Confirmed JavaScript ModuleEnrollment is active");

  // 6. Verify results
  console.log("\n=== VERIFYING ACCESS FOR STUDENT ===");
  const approvedSlugs = await getApprovedProgramSlugs(email);
  console.log("Approved program slugs:", approvedSlugs);

  for (const slug of approvedSlugs) {
    const levels = await getApprovedEnrollmentLevels(email, slug);
    console.log(`Approved levels for ${slug}:`, levels);
  }

  const allAdminRows = await getAdminStudentRows();
  const saqibAdminRows = allAdminRows.filter((r) => r.email.toLowerCase().includes("saqib"));
  console.log("\nAdmin Portal Rows for Saqib:");
  for (const r of saqibAdminRows) {
    console.log(`- Course: "${r.course}" | Module: "${r.module}" | Status: ${r.isActive ? "Active" : "Inactive"}`);
  }

  console.log("\nFix applied and verified successfully!");
}

main()
  .catch((e) => {
    console.error("Error applying fix:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
