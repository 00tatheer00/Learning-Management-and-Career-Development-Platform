import { describe, it, expect } from "vitest";
import { getRelevantKnowledge, EEST_KNOWLEDGE_BASE } from "./knowledge-base";

describe("EEST Knowledge Base", () => {
  it("contains verified academy facts", () => {
    expect(EEST_KNOWLEDGE_BASE.length).toBeGreaterThan(5);
    const about = EEST_KNOWLEDGE_BASE.find((s) => s.id === "about-eest");
    expect(about).toBeDefined();
    expect(about?.content).toContain("Emerging Edge School of Technology");
    expect(about?.content).toContain("Peshawar");
  });

  it("retrieves web development details when queried about web development", () => {
    const results = getRelevantKnowledge("What is taught in Web Development?");
    expect(results.length).toBeGreaterThan(0);
    const webSnippet = results.find((s) => s.id === "program-web-development");
    expect(webSnippet).toBeDefined();
    expect(webSnippet?.content).toContain("HTML5");
    expect(webSnippet?.content).toContain("React");
  });

  it("retrieves recordings information when asked about Google Drive recordings", () => {
    const results = getRelevantKnowledge("How do I watch missed class recordings?");
    expect(results.length).toBeGreaterThan(0);
    const recordingSnippet = results.find((s) => s.id === "portal-recordings");
    expect(recordingSnippet).toBeDefined();
    expect(recordingSnippet?.content).toContain("/student/recordings");
  });

  it("retrieves support ticket details when asked about portal problems", () => {
    const results = getRelevantKnowledge("I have a portal issue and need support");
    expect(results.length).toBeGreaterThan(0);
    const supportSnippet = results.find((s) => s.id === "portal-support-tickets");
    expect(supportSnippet).toBeDefined();
    expect(supportSnippet?.content).toContain("/student/support");
  });

  it("returns fallback snippets when query has no matching tokens", () => {
    const results = getRelevantKnowledge("xyz123456789abc!@#");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((s) => s.id === "about-eest")).toBe(true);
  });
});
