/**
 * Core multi-tenancy domain types (pure, framework-agnostic).
 *
 * These mirror the server-side / database-side model owned by the backend:
 * `ai-executive-os-backend/supabase/migrations/` — specifically
 * `20260603000002_organizations_multitenant.sql` (organizations + org scope)
 * and `20260603000007_row_level_security.sql` (RLS via `auth_org_id()` /
 * `auth_user_role()`). Keep these in sync with that migration series.
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
