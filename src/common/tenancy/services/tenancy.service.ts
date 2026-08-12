/**
 * Tenancy service — a single, centralized place that shapes the metadata
 * sent to Supabase when an organization + owner are created at signup.
 *
 * The database trigger (see `supabase/migrations/0001_multi_tenancy.sql`)
 * reads this metadata and materializes the `organizations` and
 * `organization_members` rows, so tenant isolation is enforced with RLS
 * rather than only in client code.
 */
import { normalizeOrgName, orgSlug, isValidOrgName } from "../lib/tenant";
import type { OrgRole } from "../types";

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
 * Build the auth user-metadata block for a new organization + owner.
 *
 * @param input.orgName required
 * @param input.fullName optional display name for the owner
 * @param input.role defaults to "owner" (initial role during signup)
 * @param input.orgId optional override (used to join an existing org)
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
