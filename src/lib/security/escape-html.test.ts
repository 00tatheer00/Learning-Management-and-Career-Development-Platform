import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/security/escape-html";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });

  it("leaves safe text unchanged", () => {
    expect(escapeHtml("Hello EEST")).toBe("Hello EEST");
  });
});
