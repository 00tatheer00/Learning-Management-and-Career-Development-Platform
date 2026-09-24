import { describe, expect, it } from "vitest";
import { formatDatabaseUrlWithPooling } from "./database-url";

describe("formatDatabaseUrlWithPooling", () => {
  it("appends default maxPoolSize=10 and serverless timeouts to clean mongodb+srv url", () => {
    const raw = "mongodb+srv://user:pass@cluster.mongodb.net/eest";
    const formatted = formatDatabaseUrlWithPooling(raw);

    expect(formatted).toContain("maxPoolSize=10");
    expect(formatted).toContain("minPoolSize=0");
    expect(formatted).toContain("serverSelectionTimeoutMS=5000");
    expect(formatted).toContain("connectTimeoutMS=10000");
    expect(formatted.startsWith("mongodb+srv://user:pass@cluster.mongodb.net/eest?")).toBe(true);
  });

  it("appends pooling params to mongodb+srv url that already has query parameters", () => {
    const raw = "mongodb+srv://user:pass@cluster.mongodb.net/eest?retryWrites=true&w=majority";
    const formatted = formatDatabaseUrlWithPooling(raw);

    expect(formatted).toContain("retryWrites=true");
    expect(formatted).toContain("w=majority");
    expect(formatted).toContain("maxPoolSize=10");
    expect(formatted).toContain("serverSelectionTimeoutMS=5000");
  });

  it("preserves custom maxPoolSize if already explicitly specified", () => {
    const raw = "mongodb+srv://user:pass@cluster.mongodb.net/eest?retryWrites=true&maxPoolSize=25";
    const formatted = formatDatabaseUrlWithPooling(raw);

    expect(formatted).toContain("maxPoolSize=25");
    expect(formatted).not.toContain("maxPoolSize=10");
    expect(formatted).toContain("serverSelectionTimeoutMS=5000");
  });

  it("supports standard mongodb:// protocol", () => {
    const raw = "mongodb://localhost:27017/eest";
    const formatted = formatDatabaseUrlWithPooling(raw);

    expect(formatted).toContain("maxPoolSize=10");
    expect(formatted.startsWith("mongodb://localhost:27017/eest?")).toBe(true);
  });

  it("leaves non-mongodb urls untouched", () => {
    const raw = "postgresql://user:pass@localhost:5432/db";
    const formatted = formatDatabaseUrlWithPooling(raw);
    expect(formatted).toBe(raw);
  });
});
