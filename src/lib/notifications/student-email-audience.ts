import { prisma } from "@/lib/prisma";
import { DEMO_PORTAL_STUDENT_EMAIL } from "@/lib/constants/demo-student";
import { canStudentAccessModuleContent } from "@/lib/modules/student-module-content";
import { DEMO_STUDENT_PROGRAM_SLUGS } from "@/lib/student-portal/program-scope";

export interface StudentEmailRecipient {
  id: string;
  email: string;
  name: string;
}

/** When true, student notification emails go only to the demo inbox for testing. */
export function isStudentEmailDemoOnly(): boolean {
  return process.env.STUDENT_EMAIL_DEMO_ONLY?.trim() === "true";
}

export function resolveStudentEmailRecipients(
  intended: StudentEmailRecipient[]
): StudentEmailRecipient[] {
  if (isStudentEmailDemoOnly()) {
    const first = intended[0];
    return [
      {
        id: first?.id ?? "demo-student",
        email: DEMO_PORTAL_STUDENT_EMAIL,
        name: first?.name ?? "Demo Student",
      },
    ];
  }

  const seen = new Set<string>();
  return intended.filter((row) => {
    const email = row.email?.trim().toLowerCase();
    if (!email || seen.has(email)) return false;
    seen.add(email);
    return true;
  });
}

export async function getEligibleStudentEmailRecipients(input: {
  programSlug: string;
  moduleLevel?: string | null;
}): Promise<StudentEmailRecipient[]> {
  const students = await prisma.user.findMany({
    where: {
      role: "student",
      programSlug: input.programSlug,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      level: true,
    },
  });

  const eligible = students.filter((student) =>
    canStudentAccessModuleContent(input.programSlug, student.level, input.moduleLevel, {
      email: student.email,
    })
  );

  let recipients = eligible.map((student) => ({
    id: student.id,
    email: student.email,
    name: student.name,
  }));

  if (
    !isStudentEmailDemoOnly() &&
    (DEMO_STUDENT_PROGRAM_SLUGS as readonly string[]).includes(input.programSlug)
  ) {
    recipients = await appendDemoStudentIfMissing(recipients, input);
  }

  return resolveStudentEmailRecipients(recipients);
}

async function appendDemoStudentIfMissing(
  recipients: StudentEmailRecipient[],
  input: { programSlug: string; moduleLevel?: string | null }
): Promise<StudentEmailRecipient[]> {
  const demo = await getDemoStudentRecipient();
  const demoEmail = demo.email.trim().toLowerCase();
  if (recipients.some((row) => row.email.trim().toLowerCase() === demoEmail)) {
    return recipients;
  }

  const demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
    select: { id: true, email: true, name: true, level: true, isActive: true },
  });
  if (!demoUser?.isActive) return recipients;

  const canReceive = canStudentAccessModuleContent(
    input.programSlug,
    demoUser.level,
    input.moduleLevel,
    { email: demoUser.email }
  );
  if (!canReceive) return recipients;

  return [
    ...recipients,
    {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
    },
  ];
}

export async function getDemoStudentRecipient(): Promise<StudentEmailRecipient> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_PORTAL_STUDENT_EMAIL.toLowerCase() },
    select: { id: true, email: true, name: true },
  });

  return {
    id: user?.id ?? "demo-student",
    email: DEMO_PORTAL_STUDENT_EMAIL,
    name: user?.name ?? "Demo Student",
  };
}
