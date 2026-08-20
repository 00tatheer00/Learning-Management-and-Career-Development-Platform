import { describe, it, expect, vi } from "vitest";
import { emailQueue } from "@/lib/queue/email-queue";

describe("EmailQueueManager", () => {
  it("enqueues and processes jobs using registered handlers", async () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true });
    emailQueue.registerHandler("test_email", mockHandler);

    const jobId = emailQueue.enqueue("test_email", { to: "student@test.com" });
    expect(jobId).toMatch(/^job_/);

    // Wait a brief tick for async execution
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockHandler).toHaveBeenCalledWith({ to: "student@test.com" });
    const stats = emailQueue.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });

  it("handles retry logic on failure", async () => {
    let attempts = 0;
    const failingHandler = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 2) {
        return { success: false, error: "Temporary rate limit" };
      }
      return { success: true };
    });

    emailQueue.registerHandler("retry_test", failingHandler);
    emailQueue.enqueue("retry_test", { payload: 123 }, { maxAttempts: 3 });

    // Wait for initial attempt and first retry (backoff 1000ms + buffer)
    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(failingHandler).toHaveBeenCalledTimes(2);
  });
});
