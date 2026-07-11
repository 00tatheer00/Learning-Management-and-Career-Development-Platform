import { prisma } from "@/lib/prisma";
import { DEMO_PORTAL_STUDENT_EMAIL } from "@/lib/constants/demo-student";
import { canStudentAccessModuleContent } from "@/lib/modules/student-module-content";

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

  return resolveStudentEmailRecipients(
    eligible.map((student) => ({
      id: student.id,
      email: student.email,
      name: student.name,
    }))
  );
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
