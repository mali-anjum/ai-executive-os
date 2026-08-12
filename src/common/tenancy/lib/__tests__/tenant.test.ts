import {
  assertTenantBoundary,
  isSameTenant,
  isValidOrgName,
  normalizeOrgName,
  orgSlug,
  TenantBoundaryError,
} from "@/common/tenancy";

describe("tenant lib", () => {
  describe("normalizeOrgName", () => {
    it("collapses whitespace and trims", () => {
      expect(normalizeOrgName("  Acme   Corp  ")).toBe("Acme Corp");
    });
  });

  describe("isValidOrgName", () => {
    it("requires at least 2 trimmed characters", () => {
      expect(isValidOrgName("  Acme  ")).toBe(true);
      expect(isValidOrgName("  a ")).toBe(false);
      expect(isValidOrgName("   ")).toBe(false);
    });
  });

  describe("orgSlug", () => {
    it("lowercases and slugifies the org name", () => {
      expect(orgSlug("Acme Corp")).toBe("acme-corp");
      expect(orgSlug("  Hello, World!  ")).toBe("hello-world");
    });
  });

  describe("isSameTenant", () => {
    it("requires both ids to be present and equal", () => {
      expect(isSameTenant("org-a", "org-a")).toBe(true);
      expect(isSameTenant("org-a", "org-b")).toBe(false);
      expect(isSameTenant(null, "org-a")).toBe(false);
      expect(isSameTenant(undefined, undefined)).toBe(false);
    });
  });

  describe("assertTenantBoundary", () => {
    const tenant = { orgId: "org-a", orgName: "Org A", role: "owner" as const };

    it("passes for the same org", () => {
      expect(() => assertTenantBoundary(tenant, "org-a")).not.toThrow();
    });

    it("throws a TenantBoundaryError on cross-tenant access", () => {
      expect(() => assertTenantBoundary(tenant, "org-b")).toThrow(
        TenantBoundaryError
      );
    });

    it("throws when there is no active tenant", () => {
      expect(() =>
        assertTenantBoundary({ orgId: null, orgName: null, role: "employee" }, "org-a")
      ).toThrow(/no active organization/i);
    });

    it("throws when the resource has no org boundary", () => {
      expect(() => assertTenantBoundary(tenant, null)).toThrow(
        /no organization boundary/i
      );
    });
  });
});