import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiResponse } from "@/lib/api/enrollment";
import {
  getOrAssignStudentTopic,
  ensureWebDevModule1AssignmentPublished,
  findTopicByNameOrId,
} from "@/lib/assignments/topic-assignment-service";
import {
  PROJECT_TECHNICAL_REQUIREMENTS,
  DEFAULT_WEB_DEV_ASSIGNMENT_TITLE,
  DEFAULT_WEB_DEV_ASSIGNMENT_DESCRIPTION,
} from "@/lib/constants/assignment-topics";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json(createApiResponse(false, { error: "Unauthorized" }), {
      status: 403,
    });
  }

  const programSlug = user.programSlug ?? "web-development";
  const isWebDev = programSlug === "web-development";
  const isMod1 = !user.level || user.level.trim() === "HTML & CSS" || user.level.includes("Module 1");

  if (!isWebDev || !isMod1) {
    return NextResponse.json(
      createApiResponse(true, {
        data: {
          eligible: false,
          message: "Automated website topic assignment is for Web Development Module 1 (HTML & CSS).",
        },
      })
    );
  }

  // Ensure global assignment is published
  const assignmentId = await ensureWebDevModule1AssignmentPublished();

  // Get or create topic assignment
  const topicAssignment = await getOrAssignStudentTopic(
    user.id,
    user.email,
    user.name,
    "web-development",
    "HTML & CSS"
  );

  // Fetch student's submission for this assignment if exists
  const submission = await prisma.assignmentSubmission.findFirst({
    where: {
      assignmentId,
      studentId: user.id,
    },
    orderBy: { submittedAt: "desc" },
  });

  const topicDetails = findTopicByNameOrId(topicAssignment.topic);

  return NextResponse.json(
    createApiResponse(true, {
      data: {
        eligible: true,
        assignment: {
          id: assignmentId,
          title: DEFAULT_WEB_DEV_ASSIGNMENT_TITLE,
          description: DEFAULT_WEB_DEV_ASSIGNMENT_DESCRIPTION,
          dueDate: "30 Days from Assignment",
        },
        topicAssignment: {
          id: topicAssignment.id,
          topic: topicAssignment.topic,
          topicCategory: topicAssignment.topicCategory,
          topicDetails,
          assignedAt: topicAssignment.assignedAt.toISOString(),
        },
        requirements: PROJECT_TECHNICAL_REQUIREMENTS,
        submission: submission
          ? {
              id: submission.id,
              content: submission.content,
              liveWebsiteUrl: submission.liveWebsiteUrl,
              githubUrl: submission.githubUrl,
              portfolioUrl: submission.portfolioUrl,
              assignedTopic: submission.assignedTopic,
              notes: submission.notes,
              status: submission.status,
              submittedAt: submission.submittedAt.toISOString(),
              feedback: submission.feedback,
              reviewedAt: submission.reviewedAt ? submission.reviewedAt.toISOString() : null,
            }
          : null,
      },
    })
  );
}
