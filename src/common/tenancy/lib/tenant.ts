/**
 * Pure organization/tenant helpers. No React or Redux dependencies so they
 * can be used in server components, route handlers, tests, and client code.
 */
import {
  ORG_ROLES,
  type OrgRole,
  type TenantContext,
  TenantBoundaryError,
} from "../types";

/** Collapse whitespace and trim — canonical display form. */
export function normalizeOrgName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function isValidOrgName(name: string): boolean {
  return normalizeOrgName(name).length >= 2;
}

/**
 * Derive a URL-safe, unique slug from an org name (used for uniqueness
 * checks server-side). Kept deterministic for stable lookups.
 */
export function orgSlug(name: string): string {
  return normalizeOrgName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

/** True only when both ids exist and match. */
export function isSameTenant(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) return false;
  return a === b;
}

/**
 * Enforce the organization boundary for a tenant-owned resource.
 *
 * - throws when the active tenant is undefined,
 * - throws when the resource has no org boundary,
 * - throws when the resource belongs to a different org (cross-tenant).
 */
export function assertTenantBoundary(
  tenant: TenantContext,
  targetOrgId: string | null | undefined
): void {
  if (!tenant.orgId) {
    throw new TenantBoundaryError("No active organization context.", null);
  }
  if (!targetOrgId) {
    throw new TenantBoundaryError(
      "Requested resource has no organization boundary.",
      tenant.orgId
    );
  }
  if (!isSameTenant(tenant.orgId, targetOrgId)) {
    throw new TenantBoundaryError(
      "Cross-tenant access denied: resource belongs to another organization.",
      tenant.orgId
    );
  }
}

export function isOrgRole(value: unknown): value is OrgRole {
  return (
    typeof value === "string" && (ORG_ROLES as readonly string[]).includes(value)
  );
}
