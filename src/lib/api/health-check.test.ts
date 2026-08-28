import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/health/route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      count: vi.fn(),
    },
  },
}));

describe("Health Check API (/api/health)", () => {
  it("returns 200 and ok status when database is reachable", async () => {
    vi.mocked(prisma.user.count).mockResolvedValueOnce(1);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.db.status).toBe("connected");
    expect(typeof data.db.latencyMs).toBe("number");
    expect(data.server.nodeVersion).toBe(process.version);
  });

  it("returns 503 and degraded status when database fails", async () => {
    vi.mocked(prisma.user.count).mockRejectedValueOnce(new Error("Connection refused"));

    const response = await GET();
    expect(response.status).toBe(503);

    const data = await response.json();
    expect(data.status).toBe("degraded");
    expect(data.db.status).toBe("error");
  });
});
