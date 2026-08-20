import { describe, expect, it } from "vitest";
import { resolveCanonicalModule } from "@/lib/api/class-recordings";

describe("Class Recordings - Multi-Module Isolation & Canonical Resolution", () => {
  it("resolves canonical module names for Web Development correctly", () => {
    expect(resolveCanonicalModule("web-development", "HTML & CSS")).toBe("HTML & CSS");
    expect(resolveCanonicalModule("web-development", "html & css")).toBe("HTML & CSS");
    expect(resolveCanonicalModule("web-development", "html-css")).toBe("HTML & CSS");
    expect(resolveCanonicalModule("web-development", "Module 1")).toBe("HTML & CSS");
    expect(resolveCanonicalModule("web-development", "mod1")).toBe("HTML & CSS");

    expect(resolveCanonicalModule("web-development", "JavaScript")).toBe("JavaScript");
    expect(resolveCanonicalModule("web-development", "javascript")).toBe("JavaScript");
    expect(resolveCanonicalModule("web-development", "js")).toBe("JavaScript");
    expect(resolveCanonicalModule("web-development", "Module 2")).toBe("JavaScript");
    expect(resolveCanonicalModule("web-development", "mod2")).toBe("JavaScript");

    expect(resolveCanonicalModule("web-development", "React")).toBe("React");
    expect(resolveCanonicalModule("web-development", "react")).toBe("React");
    expect(resolveCanonicalModule("web-development", "Module 3")).toBe("React");

    expect(resolveCanonicalModule("web-development", "Backend + Database")).toBe("Backend + Database");
    expect(resolveCanonicalModule("web-development", "backend")).toBe("Backend + Database");
    expect(resolveCanonicalModule("web-development", "Module 4")).toBe("Backend + Database");
  });

  it("resolves canonical module names for Flutter App Development", () => {
    expect(resolveCanonicalModule("app-development", "Dart & OOP")).toBe("Dart & OOP");
    expect(resolveCanonicalModule("app-development", "Module 1")).toBe("Dart & OOP");
    expect(resolveCanonicalModule("app-development", "Flutter Frontend")).toBe("Flutter Frontend");
    expect(resolveCanonicalModule("app-development", "Module 2")).toBe("Flutter Frontend");
    expect(resolveCanonicalModule("app-development", "Firebase & APIs")).toBe("Firebase & APIs");
    expect(resolveCanonicalModule("app-development", "Module 3")).toBe("Firebase & APIs");
  });

  it("handles null, undefined, or all gracefully by falling back to default module", () => {
    expect(resolveCanonicalModule("web-development", null)).toBe("HTML & CSS");
    expect(resolveCanonicalModule("web-development", undefined)).toBe("HTML & CSS");
    expect(resolveCanonicalModule("web-development", "all")).toBe("HTML & CSS");
  });
});
