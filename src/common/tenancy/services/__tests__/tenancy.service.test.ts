import { buildOrganizationMetadata } from "@/common/tenancy";

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

  it("keeps an explicitly provided org id (joining an existing tenant)", () => {
    const meta = buildOrganizationMetadata({
      orgName: "Acme",
      orgId: "org-fixed",
    });
    expect(meta.org_id).toBe("org-fixed");
  });

  it("includes the owner full name when provided", () => {
    const meta = buildOrganizationMetadata({
      orgName: "Acme",
      fullName: "  Ada Lovelace ",
    });
    expect(meta.full_name).toBe("Ada Lovelace");
  });

  it("rejects an org name that is too short", () => {
    expect(() => buildOrganizationMetadata({ orgName: "  a " })).toThrow(
      /at least 2 characters/i
    );
  });
});