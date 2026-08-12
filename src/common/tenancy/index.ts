export {
  ORG_ROLES,
  type OrgRole,
  type Organization,
  type OrgMember,
  type TenantContext,
  TenantBoundaryError,
} from "./types";

export {
  normalizeOrgName,
  orgSlug,
  isValidOrgName,
  isSameTenant,
  assertTenantBoundary,
  isOrgRole,
} from "./lib/tenant";

export { buildOrganizationMetadata, type OrganizationMetadata } from "./services/tenancy.service";

export { useTenant } from "./hooks/useTenant";
