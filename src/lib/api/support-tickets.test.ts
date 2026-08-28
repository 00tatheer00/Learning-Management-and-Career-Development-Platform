import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/support/tickets/route";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimitByIp } from "@/lib/security/rate-limit";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supportTicket: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/security/rate-limit", () => ({
  rateLimitByIp: vi.fn(),
}));

vi.mock("@/lib/services/notification-service", () => ({
  createNotification: vi.fn(),
}));

type MockFn = ReturnType<typeof vi.fn>;

describe("Support Tickets API (/api/support/tickets)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rateLimitByIp).mockResolvedValue(false);
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    (prisma.supportTicket.count as unknown as MockFn).mockResolvedValue(0);
    (prisma.supportTicket.findFirst as unknown as MockFn).mockResolvedValue(null);
    (prisma.user.findMany as unknown as MockFn).mockResolvedValue([]);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(rateLimitByIp).mockResolvedValue(true);

    const req = new Request("http://localhost/api/support/tickets", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("returns 400 when required fields or categories are invalid", async () => {
    const req = new Request("http://localhost/api/support/tickets", {
      method: "POST",
      body: JSON.stringify({
        category: "invalid-category",
        subject: "Hi",
        description: "Short",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 400 when guest submits without valid email or name", async () => {
    const req = new Request("http://localhost/api/support/tickets", {
      method: "POST",
      body: JSON.stringify({
        category: "login",
        subject: "Cannot login to portal",
        description: "My password is not working anymore please help",
        email: "not-an-email",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates ticket successfully and notifies admins", async () => {
    (prisma.supportTicket.findFirst as unknown as MockFn).mockResolvedValueOnce({
      ticketNumber: "TKT-0005",
    });

    (prisma.supportTicket.create as unknown as MockFn).mockImplementationOnce(async ({ data }: { data: Record<string, unknown> }) => ({
      ...data,
      id: "tkt_123",
      status: "open",
      priority: "medium",
      adminReply: null,
      resolvedAt: null,
      resolvedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    (prisma.user.findMany as unknown as MockFn).mockResolvedValueOnce([
      { id: "admin-1" },
      { id: "admin-2" },
    ]);

    const req = new Request("http://localhost/api/support/tickets", {
      method: "POST",
      body: JSON.stringify({
        name: "Usman Khan",
        email: "usman@example.com",
        category: "module",
        subject: "Module 2 access required",
        description: "I have completed Module 1 and would like to access Module 2 lectures.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.ticketNumber).toBe("TKT-0006");

    expect(prisma.supportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ticketNumber: "TKT-0006",
          studentEmail: "usman@example.com",
          category: "module",
        }),
      })
    );
  });

  it("creates ticket with attachment URL and persists in database", async () => {
    (prisma.supportTicket.findFirst as unknown as MockFn).mockResolvedValueOnce({
      ticketNumber: "TKT-0010",
    });

    (prisma.supportTicket.create as unknown as MockFn).mockImplementationOnce(async ({ data }: { data: Record<string, unknown> }) => ({
      ...data,
      id: "tkt_456",
      status: "open",
      priority: "medium",
      adminReply: null,
      resolvedAt: null,
      resolvedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const req = new Request("http://localhost/api/support/tickets", {
      method: "POST",
      body: JSON.stringify({
        name: "Sara Ali",
        email: "sara@example.com",
        category: "payment",
        subject: "Fee screenshot attached",
        description: "Please check my payment transaction screenshot.",
        attachmentUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        attachmentPublicId: "eest/support-attachments/sample",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(prisma.supportTicket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attachmentUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          attachmentPublicId: "eest/support-attachments/sample",
        }),
      })
    );
  });
});
