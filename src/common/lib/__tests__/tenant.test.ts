import {
  assertTenantBoundary,
  buildOrganizationMetadata,
  isSameTenant,
  isValidOrgName,
  normalizeOrgName,
  orgSlug,
} from "@/common/lib/tenant";
import { TenantBoundaryError } from "@/common/types/tenancy";

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

  describe("buildOrganizationMetadata", () => {
    beforeAll(() => {
      // jsdom does not expose crypto.randomUUID — mock a deterministic value.
      Object.defineProperty(globalThis.crypto, "randomUUID", {
        value: jest.fn(() => "00000000-0000-0000-0000-000000000001"),
        configurable: true,
      });
    });

    it("assigns the initial owner role during signup", () => {
      const meta = buildOrganizationMetadata({ orgName: "Acme Corp" });
      expect(meta.role).toBe("owner");
    });

    it("normalizes the org name and derives a slug", () => {
      const meta = buildOrganizationMetadata({ orgName: "  Acme   Corp  " });
      expect(meta.org_name).toBe("Acme Corp");
      expect(meta.org_slug).toBe("acme-corp");
      expect(meta.org_id).toBe("00000000-0000-0000-0000-000000000001");
    });

    it("keeps an explicitly provided org id", () => {
      const meta = buildOrganizationMetadata({
        orgName: "Acme",
        orgId: "org-fixed",
      });
      expect(meta.org_id).toBe("org-fixed");
    });

    it("rejects an org name that is too short", () => {
      expect(() => buildOrganizationMetadata({ orgName: "  a " })).toThrow(
        /at least 2 characters/i
      );
    });
  });
});