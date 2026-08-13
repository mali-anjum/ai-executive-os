/**
 * Pure organization/tenant helpers. No React or Redux dependencies so they
 * can be used in server components, route handlers, tests, and client code.
 */
import {
  ORG_ROLES,
  type OrgRole,
  type TenantContext,
  TenantBoundaryError,
} from "@/common/types/tenancy";

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

export type OrganizationMetadata = {
  org_id: string;
  org_name: string;
  org_slug: string;
  full_name?: string;
  role: OrgRole;
};

function createOrgId(): string {
  return crypto.randomUUID();
}

/**
 * Build the auth user-metadata block for a new organization + owner at signup.
 *
 * The backend owns the database schema (see `ai-executive-os-backend/
 * supabase/migrations/`). Its RLS reads `org_id`/`role` from this metadata via
 * `auth_org_id()` / `auth_user_role()` to scope the user's tenant access.
 */
export function buildOrganizationMetadata(input: {
  orgName: string;
  fullName?: string;
  role?: OrgRole;
  orgId?: string;
}): OrganizationMetadata {
  const normalized = normalizeOrgName(input.orgName);
  if (!isValidOrgName(normalized)) {
    throw new Error(
      "Organization name is required and must be at least 2 characters."
    );
  }

  const metadata: OrganizationMetadata = {
    org_id: input.orgId ?? createOrgId(),
    org_name: normalized,
    org_slug: orgSlug(normalized),
    role: input.role ?? "owner",
  };

  if (input.fullName?.trim()) {
    metadata.full_name = input.fullName.trim();
  }

  return metadata;
}
