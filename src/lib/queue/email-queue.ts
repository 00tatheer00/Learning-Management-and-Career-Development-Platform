/**
 * Asynchronous Background Email Delivery Queue
 * Provides non-blocking execution, retry mechanisms with exponential backoff,
 * and error telemetry so API routes never hang or fail due to Resend rate limits or timeouts.
 */

import crypto from "crypto";

export interface EmailJob<T = Record<string, unknown>> {
  id: string;
  type: string;
  payload: T;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  lastAttemptAt?: Date;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export type EmailJobHandler<T = Record<string, unknown>> = (
  payload: T
) => Promise<{ success: boolean; error?: string }>;

class EmailQueueManager {
  private queue: EmailJob[] = [];
  private handlers = new Map<string, EmailJobHandler>();
  private isProcessing = false;
  private maxRetries = 3;

  /**
   * Register a job handler for a specific email type
   */
  public registerHandler<T = Record<string, unknown>>(
    type: string,
    handler: EmailJobHandler<T>
  ): void {
    this.handlers.set(type, handler as EmailJobHandler);
  }

  /**
   * Enqueue an email job for background processing
   */
  public enqueue<T = Record<string, unknown>>(
    type: string,
    payload: T,
    options: { maxAttempts?: number } = {}
  ): string {
    const jobId = `job_${crypto.randomUUID()}`;
    const job: EmailJob<T> = {
      id: jobId,
      type,
      payload,
      attempts: 0,
      maxAttempts: options.maxAttempts ?? this.maxRetries,
      createdAt: new Date(),
      status: "pending",
    };

    this.queue.push(job as EmailJob);

    // Trigger async processing non-blockingly
    void this.processNext();

    return jobId;
  }

  /**
   * Process jobs in queue
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing) return;

    const job = this.queue.find((j) => j.status === "pending");
    if (!job) return;

    this.isProcessing = true;
    job.status = "processing";
    job.attempts += 1;
    job.lastAttemptAt = new Date();

    const handler = this.handlers.get(job.type);

    if (!handler) {
      job.status = "failed";
      job.error = `No handler registered for email type: ${job.type}`;
      this.isProcessing = false;
      void this.processNext();
      return;
    }

    try {
      const result = await handler(job.payload);

      if (result.success) {
        job.status = "completed";
      } else {
        throw new Error(result.error ?? "Handler returned unsuccessful result");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      job.error = errorMsg;

      if (job.attempts < job.maxAttempts) {
        job.status = "pending";
        // Exponential backoff delay: 2^(attempts-1) * 1000 ms
        const backoffMs = Math.pow(2, job.attempts - 1) * 1000;
        setTimeout(() => {
          void this.processNext();
        }, backoffMs);
      } else {
        job.status = "failed";
        console.error(`[EmailQueue] Job ${job.id} failed after ${job.attempts} attempts:`, errorMsg);
      }
    } finally {
      this.isProcessing = false;
      // Continue with remaining pending jobs
      if (this.queue.some((j) => j.status === "pending")) {
        void this.processNext();
      }
    }
  }

  /**
   * Get queue statistics
   */
  public getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter((j) => j.status === "pending").length,
      processing: this.queue.filter((j) => j.status === "processing").length,
      completed: this.queue.filter((j) => j.status === "completed").length,
      failed: this.queue.filter((j) => j.status === "failed").length,
    };
  }

  /**
   * Clear completed and failed jobs
   */
  public purgeOldJobs(maxAgeMs = 3600000) {
    const cutoff = new Date(Date.now() - maxAgeMs);
    this.queue = this.queue.filter(
      (j) => j.status === "pending" || j.status === "processing" || j.createdAt > cutoff
    );
  }
}

// Global singleton instance
export const emailQueue = new EmailQueueManager();
