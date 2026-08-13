"use client";

import { useOrg } from "@/common/hooks/useOrg";
import { useUser } from "@/common/hooks/useUser";
import { isOrgRole, isSameTenant } from "../lib/tenant";
import type { OrgRole } from "@/common/types/tenancy";

/**
 * Composer hook exposing the active tenant context and an organization
 * boundary guard. Components/hooks must use this (or `assertTenantBoundary`)
 * instead of reaching into the store directly.
 */
export function useTenant() {
  const { orgId, orgName } = useOrg();
  const { role } = useUser();

  const tenantRole: OrgRole = role && isOrgRole(role) ? role : "employee";

  /** Whether the signed-in user belongs to the given organization. */
  const canAccess = (targetOrgId: string | null | undefined): boolean =>
    isSameTenant(orgId, targetOrgId);

  return {
    orgId,
    orgName,
    role: tenantRole,
    isAdmin: tenantRole === "owner" || tenantRole === "admin",
    canAccess,
  };
}
