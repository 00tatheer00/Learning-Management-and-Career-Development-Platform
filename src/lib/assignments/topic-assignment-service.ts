import "server-only";

import { prisma } from "@/lib/prisma";
import {
  ASSIGNMENT_TOPIC_POOL,
  DEFAULT_WEB_DEV_ASSIGNMENT_TITLE,
  DEFAULT_WEB_DEV_ASSIGNMENT_DESCRIPTION,
  type WebsiteTopic,
} from "@/lib/constants/assignment-topics";

export interface StudentTopicAssignmentResult {
  id: string;
  studentId: string;
  studentName?: string | null;
  email: string;
  programSlug: string;
  moduleName: string;
  topic: string;
  topicCategory?: string | null;
  topicDetails?: WebsiteTopic;
  assignedAt: Date;
}

export function findTopicByNameOrId(nameOrId: string): WebsiteTopic | undefined {
  const normalized = nameOrId.trim().toLowerCase();
  return (
    ASSIGNMENT_TOPIC_POOL.find((t) => t.id.toLowerCase() === normalized) ||
    ASSIGNMENT_TOPIC_POOL.find((t) => t.name.toLowerCase() === normalized) ||
    ASSIGNMENT_TOPIC_POOL.find((t) => normalized.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(normalized))
  );
}

/**
 * Ensures the Web Development Module 1 capstone assignment exists in the Assignment collection.
 */
export async function ensureWebDevModule1AssignmentPublished(): Promise<string> {
  const existing = await prisma.assignment.findFirst({
    where: {
      programSlug: "web-development",
      OR: [{ level: "HTML & CSS" }, { level: "Module 1 – HTML & CSS" }, { level: null }],
    },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing.id;
  }

  // Find a trainer for web-development or fallback
  const trainer = await prisma.user.findFirst({
    where: { role: "trainer", programSlug: "web-development" },
    select: { id: true },
  });

  const trainerId = trainer?.id ?? "system-trainer";

  const newAssignment = await prisma.assignment.create({
    data: {
      id: crypto.randomUUID(),
      programSlug: "web-development",
      level: "HTML & CSS",
      title: DEFAULT_WEB_DEV_ASSIGNMENT_TITLE,
      description: DEFAULT_WEB_DEV_ASSIGNMENT_DESCRIPTION,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      trainerId,
    },
  });

  return newAssignment.id;
}

/**
 * Gets or assigns a persistent topic for a student in Web Development Module 1.
 * Ensures balanced distribution across the pool to minimize duplicates.
 */
export async function getOrAssignStudentTopic(
  studentId: string,
  email: string,
  studentName?: string | null,
  programSlug = "web-development",
  moduleName = "HTML & CSS"
): Promise<StudentTopicAssignmentResult> {
  // Check if topic is already assigned
  const existing = await prisma.studentTopicAssignment.findFirst({
    where: {
      studentId,
      programSlug,
      moduleName,
    },
  });

  if (existing) {
    const topicDetails = findTopicByNameOrId(existing.topic);
    return {
      id: existing.id,
      studentId: existing.studentId,
      studentName: existing.studentName,
      email: existing.email,
      programSlug: existing.programSlug,
      moduleName: existing.moduleName,
      topic: existing.topic,
      topicCategory: existing.topicCategory,
      topicDetails,
      assignedAt: existing.assignedAt,
    };
  }

  // Calculate topic counts among currently assigned students to balance distribution
  const existingAssignments = await prisma.studentTopicAssignment.findMany({
    where: {
      programSlug,
      moduleName,
    },
    select: { topic: true },
  });

  const topicCountMap: Record<string, number> = {};
  for (const topic of ASSIGNMENT_TOPIC_POOL) {
    topicCountMap[topic.name] = 0;
  }

  for (const a of existingAssignments) {
    topicCountMap[a.topic] = (topicCountMap[a.topic] || 0) + 1;
  }

  // Find minimum assigned count
  const minCount = Math.min(...Object.values(topicCountMap));
  const candidateTopics = ASSIGNMENT_TOPIC_POOL.filter(
    (t) => (topicCountMap[t.name] || 0) === minCount
  );

  // Random selection among least-assigned candidate topics
  const selected = candidateTopics[Math.floor(Math.random() * candidateTopics.length)];

  // Ensure global assignment is published
  await ensureWebDevModule1AssignmentPublished().catch(() => null);

  const created = await prisma.studentTopicAssignment.create({
    data: {
      id: crypto.randomUUID(),
      studentId,
      studentName: studentName || null,
      email: email.toLowerCase(),
      programSlug,
      moduleName,
      topic: selected.name,
      topicCategory: selected.category,
    },
  });

  return {
    id: created.id,
    studentId: created.studentId,
    studentName: created.studentName,
    email: created.email,
    programSlug: created.programSlug,
    moduleName: created.moduleName,
    topic: created.topic,
    topicCategory: created.topicCategory,
    topicDetails: selected,
    assignedAt: created.assignedAt,
  };
}

/**
 * Automatically assigns website topics to all eligible students in Web Development Module 1.
 */
export async function autoAssignTopicsForWebDevStudents(): Promise<{
  totalEligible: number;
  assignedCount: number;
  existingCount: number;
}> {
  // Ensure assignment is published
  await ensureWebDevModule1AssignmentPublished();

  // Find all active students in Web Development Module 1
  const students = await prisma.user.findMany({
    where: {
      role: "student",
      isActive: true,
      programSlug: "web-development",
    },
    select: {
      id: true,
      email: true,
      name: true,
      level: true,
    },
  });

  let assignedCount = 0;
  let existingCount = 0;

  for (const student of students) {
    // Only Module 1 students ("HTML & CSS" or null/empty which defaults to Module 1)
    const isMod1 = !student.level || student.level.trim() === "HTML & CSS" || student.level.includes("Module 1");
    if (!isMod1) continue;

    const existing = await prisma.studentTopicAssignment.findFirst({
      where: {
        studentId: student.id,
        programSlug: "web-development",
        moduleName: "HTML & CSS",
      },
    });

    if (existing) {
      existingCount++;
    } else {
      await getOrAssignStudentTopic(student.id, student.email, student.name, "web-development", "HTML & CSS");
      assignedCount++;
    }
  }

  return {
    totalEligible: assignedCount + existingCount,
    assignedCount,
    existingCount,
  };
}

export interface StudentAutomatedAssignmentView {
  studentId: string;
  studentName: string;
  email: string;
  batch?: string | null;
  assignedTopic: string;
  topicCategory?: string | null;
  topicDetails?: WebsiteTopic;
  assignedAt: string;
  submission?: {
    id: string;
    content: string;
    liveWebsiteUrl?: string | null;
    githubUrl?: string | null;
    portfolioUrl?: string | null;
    notes?: string | null;
    status: string;
    submittedAt: string;
    feedback?: string | null;
    reviewedAt?: string | null;
  } | null;
}

/**
 * Returns complete assignment overview for Admin & Trainer management dashboard.
 */
export async function getAllWebDevModule1Assignments(): Promise<StudentAutomatedAssignmentView[]> {
  const students = await prisma.user.findMany({
    where: {
      role: "student",
      programSlug: "web-development",
    },
    select: {
      id: true,
      name: true,
      email: true,
      batch: true,
      level: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const assignment = await prisma.assignment.findFirst({
    where: {
      programSlug: "web-development",
      OR: [{ level: "HTML & CSS" }, { level: null }],
    },
  });

  const assignmentId = assignment?.id;

  const topicAssignments = await prisma.studentTopicAssignment.findMany({
    where: {
      programSlug: "web-development",
      moduleName: "HTML & CSS",
    },
  });

  const submissions = assignmentId
    ? await prisma.assignmentSubmission.findMany({
        where: { assignmentId },
      })
    : [];

  const topicMap = new Map(topicAssignments.map((t) => [t.studentId, t]));
  const submissionMap = new Map(submissions.map((s) => [s.studentId, s]));

  const results: StudentAutomatedAssignmentView[] = [];

  for (const student of students) {
    const isMod1 = !student.level || student.level.trim() === "HTML & CSS" || student.level.includes("Module 1");
    if (!isMod1) continue;

    let topicRecord = topicMap.get(student.id);

    // If student has no topic yet, assign on-the-fly
    if (!topicRecord) {
      const assigned = await getOrAssignStudentTopic(
        student.id,
        student.email,
        student.name,
        "web-development",
        "HTML & CSS"
      );
      topicRecord = {
        id: assigned.id,
        studentId: assigned.studentId,
        studentName: assigned.studentName || null,
        email: assigned.email,
        programSlug: assigned.programSlug,
        moduleName: assigned.moduleName,
        topic: assigned.topic,
        topicCategory: assigned.topicCategory || null,
        assignedAt: assigned.assignedAt,
      };
    }

    const sub = submissionMap.get(student.id);
    const topicDetails = findTopicByNameOrId(topicRecord.topic);

    results.push({
      studentId: student.id,
      studentName: student.name,
      email: student.email,
      batch: student.batch,
      assignedTopic: topicRecord.topic,
      topicCategory: topicRecord.topicCategory,
      topicDetails,
      assignedAt: topicRecord.assignedAt.toISOString(),
      submission: sub
        ? {
            id: sub.id,
            content: sub.content,
            liveWebsiteUrl: sub.liveWebsiteUrl,
            githubUrl: sub.githubUrl,
            portfolioUrl: sub.portfolioUrl,
            notes: sub.notes,
            status: sub.status,
            submittedAt: sub.submittedAt.toISOString(),
            feedback: sub.feedback,
            reviewedAt: sub.reviewedAt ? sub.reviewedAt.toISOString() : null,
          }
        : null,
    });
  }

  return results;
}
