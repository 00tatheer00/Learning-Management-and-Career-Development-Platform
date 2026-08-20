import { describe, it, expect } from "vitest";
import { apiSuccess, apiError } from "@/lib/api/api-response";

describe("api-response", () => {
  it("creates a standardized success response", async () => {
    const res = apiSuccess({ count: 42 }, { page: 1 }, 200);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ count: 42 });
    expect(body.meta).toEqual({ page: 1 });
    expect(body.timestamp).toBeDefined();
  });

  it("creates a standardized error response", async () => {
    const res = apiError("Invalid credentials", 401, "UNAUTHORIZED");
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Invalid credentials");
    expect(body.code).toBe("UNAUTHORIZED");
    expect(body.timestamp).toBeDefined();
  });
});
