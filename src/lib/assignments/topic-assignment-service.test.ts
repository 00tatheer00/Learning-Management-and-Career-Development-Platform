/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ASSIGNMENT_TOPIC_POOL,
  PROJECT_TECHNICAL_REQUIREMENTS,
} from "@/lib/constants/assignment-topics";
import {
  findTopicByNameOrId,
  getOrAssignStudentTopic,
} from "@/lib/assignments/topic-assignment-service";
import { prisma } from "@/lib/prisma";

describe("Automated Assignment System - Topic Allocation & Persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("contains at least 20 professional unique website topics in the pool", () => {
    expect(ASSIGNMENT_TOPIC_POOL.length).toBeGreaterThanOrEqual(20);
    const ids = new Set(ASSIGNMENT_TOPIC_POOL.map((t) => t.id));
    expect(ids.size).toBe(ASSIGNMENT_TOPIC_POOL.length);
  });

  it("contains all mandatory technical requirements including Portfolio", () => {
    const portfolioReq = PROJECT_TECHNICAL_REQUIREMENTS.find((r) => r.id === "portfolio");
    expect(portfolioReq).toBeDefined();
    expect(portfolioReq?.title).toContain("Portfolio");

    const html5Req = PROJECT_TECHNICAL_REQUIREMENTS.find((r) => r.id === "html5");
    expect(html5Req).toBeDefined();

    const gitReq = PROJECT_TECHNICAL_REQUIREMENTS.find((r) => r.id === "git_github");
    expect(gitReq).toBeDefined();
  });

  it("findTopicByNameOrId correctly resolves topics", () => {
    const restaurant = findTopicByNameOrId("restaurant");
    expect(restaurant).toBeDefined();
    expect(restaurant?.category).toBe("Food & Dining");

    const gym = findTopicByNameOrId("PowerPulse Gym & Fitness Club");
    expect(gym).toBeDefined();
    expect(gym?.id).toBe("gym-fitness");
  });

  it("returns existing topic assignment idempotently without creating duplicates", async () => {
    const mockExisting = {
      id: "topic-123",
      studentId: "student-1",
      studentName: "Test Student",
      email: "test@example.com",
      programSlug: "web-development",
      moduleName: "HTML & CSS",
      topic: "Modern Restaurant & Cafe",
      topicCategory: "Food & Dining",
      assignedAt: new Date("2026-08-16T10:00:00Z"),
    };

    vi.spyOn(prisma.studentTopicAssignment, "findFirst").mockResolvedValueOnce(mockExisting as any);

    const result = await getOrAssignStudentTopic(
      "student-1",
      "test@example.com",
      "Test Student",
      "web-development",
      "HTML & CSS"
    );

    expect(result.id).toBe("topic-123");
    expect(result.topic).toBe("Modern Restaurant & Cafe");
    expect(result.studentId).toBe("student-1");
  });

  it("allocates a new topic when none exists and minimizes topic duplicates", async () => {
    vi.spyOn(prisma.studentTopicAssignment, "findFirst").mockResolvedValueOnce(null);
    vi.spyOn(prisma.studentTopicAssignment, "findMany").mockResolvedValueOnce([
      { topic: "Modern Restaurant & Cafe" } as any,
      { topic: "Luxury Boutique Hotel & Resort" } as any,
    ]);

    const createdRecord = {
      id: "new-topic-id",
      studentId: "student-2",
      studentName: "Student Two",
      email: "student2@example.com",
      programSlug: "web-development",
      moduleName: "HTML & CSS",
      topic: "Prime Real Estate & Property Hub",
      topicCategory: "Real Estate",
      assignedAt: new Date(),
    };

    vi.spyOn(prisma.studentTopicAssignment, "create").mockResolvedValueOnce(createdRecord as any);
    vi.spyOn(prisma.assignment, "findFirst").mockResolvedValueOnce({ id: "global-assignment-1" } as any);

    const result = await getOrAssignStudentTopic(
      "student-2",
      "student2@example.com",
      "Student Two",
      "web-development",
      "HTML & CSS"
    );

    expect(result.id).toBe("new-topic-id");
    expect(result.studentId).toBe("student-2");
    expect(result.topic).toBeDefined();
  });
});
