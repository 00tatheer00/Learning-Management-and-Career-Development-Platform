import { describe, expect, it } from "vitest";
import {
  canAdminApproveReject,
  canAdminWrite,
  isAdminRole,
} from "@/lib/auth/admin-roles";

describe("admin roles", () => {
  it("treats admin and admin_readonly as admin roles", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("admin_readonly")).toBe(true);
    expect(isAdminRole("student")).toBe(false);
  });

  it("allows write for super admin and operations admin", () => {
    expect(canAdminWrite("admin")).toBe(true);
    expect(canAdminWrite("admin_readonly")).toBe(true);
    expect(canAdminWrite("trainer")).toBe(false);
  });

  it("restricts approve/reject to super admin only", () => {
    expect(canAdminApproveReject("admin")).toBe(true);
    expect(canAdminApproveReject("admin_readonly")).toBe(false);
  });
});
