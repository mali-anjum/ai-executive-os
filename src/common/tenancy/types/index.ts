/**
 * Core multi-tenancy domain types (pure, framework-agnostic).
 *
 * These mirror the server-side / database-side model (organizations +
 * organization_members). Keep them in sync with
 * `supabase/migrations/0001_multi_tenancy.sql`.
 */

export const ORG_ROLES = ["owner", "admin", "manager", "employee"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type OrgMember = {
  orgId: string;
  userId: string;
  role: OrgRole;
  email: string;
  fullName: string | null;
};

/**
 * The active tenant context for the signed-in user (composed from
 * orgSlice + userSlice).
 */
export type TenantContext = {
  orgId: string | null;
  orgName: string | null;
  role: OrgRole;
};

/** Thrown when a request crosses an organization boundary. */
export class TenantBoundaryError extends Error {
  readonly orgId: string | null;

  constructor(message: string, orgId: string | null = null) {
    super(message);
    this.name = "TenantBoundaryError";
    this.orgId = orgId;
  }
}
