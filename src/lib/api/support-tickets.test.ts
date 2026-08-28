import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/support/tickets/route";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimitByIp } from "@/lib/security/rate-limit";
import { createNotification } from "@/lib/services/notification-service";

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

describe("Support Tickets API (/api/support/tickets)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rateLimitByIp).mockResolvedValue(false);
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    vi.mocked(prisma.supportTicket.count).mockResolvedValue(0);
    vi.mocked(prisma.supportTicket.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
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
    vi.mocked(prisma.supportTicket.findFirst).mockResolvedValueOnce({
      ticketNumber: "TKT-0005",
    } as unknown as { ticketNumber: string });

    vi.mocked(prisma.supportTicket.create).mockImplementationOnce(async ({ data }) => ({
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

    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
      { id: "admin-1" },
      { id: "admin-2" },
    ] as unknown as { id: string }[]);

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
});
