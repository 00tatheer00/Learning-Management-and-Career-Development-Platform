import { describe, it, expect } from "vitest";
import { isValidSubmissionUrl, sanitizeSubmissionUrl } from "@/lib/security/url-sanitizer";

describe("url-sanitizer", () => {
  it("accepts valid https and http URLs", () => {
    expect(isValidSubmissionUrl("https://github.com/myuser/myrepo")).toBe(true);
    expect(isValidSubmissionUrl("https://my-app.vercel.app/demo")).toBe(true);
    expect(isValidSubmissionUrl("http://localhost:3000")).toBe(true);
    expect(isValidSubmissionUrl("https://subdomain.example.co.uk/path?param=1")).toBe(true);
  });

  it("rejects malicious or invalid URLs", () => {
    expect(isValidSubmissionUrl("javascript:alert(1)")).toBe(false);
    expect(isValidSubmissionUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isValidSubmissionUrl("file:///etc/passwd")).toBe(false);
    expect(isValidSubmissionUrl("vbscript:msgbox(1)")).toBe(false);
    expect(isValidSubmissionUrl("")).toBe(false);
    expect(isValidSubmissionUrl("not a url")).toBe(false);
    expect(isValidSubmissionUrl("https://")).toBe(false);
    expect(isValidSubmissionUrl("https://user:pass@example.com")).toBe(false);
  });

  it("sanitizes URLs correctly", () => {
    expect(sanitizeSubmissionUrl("  https://github.com/user/project  ")).toBe("https://github.com/user/project");
    expect(sanitizeSubmissionUrl("javascript:evil()")).toBeNull();
  });
});
