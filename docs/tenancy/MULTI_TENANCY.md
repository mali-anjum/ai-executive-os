# Multi-Tenancy Foundation

Applies to `src/common/tenancy/` (client) and the **database-side** contract in
`supabase/migrations/0001_multi_tenancy.sql` (server-side / database-side isolation,
applied in the Supabase project the backend uses).

## Goal

Every authenticated user belongs to exactly one **organization (tenant)**. Every
tenant-owned resource carries an organization boundary, and isolation is enforced
by the **database** (RLS), never only by client code. This prevents Org A from
reading or mutating Org B's data even if a request is forged.

## Domain model

| Entity | Field | Notes |
|--------|-------|-------|
| `organizations` | `id` (uuid, PK) | The tenant |
| | `name` | display name, ≥ 2 chars |
| | `slug` | unique, `a-z0-9` + `-` (uniqueness check server-side) |
| `organization_members` | `org_id` + `user_id` (composite PK) | membership link |
| | `role` | `owner` \| `admin` \| `manager` \| `employee` |

`src/common/tenancy/types/` mirrors these. `OrgRole` also drives
`src/auth/hooks/getRolePermissions.ts` (an `owner` is treated as admin/leadership).

## Signup flow (frontend → DB)

1. The signup form collects the four fields: **email, full name, password,
   organization name** (`src/auth/services/form-resolvers.ts`).
2. `SignupScreen` / `CompleteProfileScreen` call
   `buildOrganizationMetadata(...)` (`src/common/tenancy/services/tenancy.service.ts`),
   which produces `org_id`, `org_name`, `org_slug`, `role: "owner"` (+ `full_name`).
3. That block is passed to Supabase as `user_metadata`.
4. The `on_auth_user_created` trigger (`0001_multi_tenancy.sql`) materializes the
   `organizations` row and an `organization_members` row with role **owner** at the
   database level.

This is the single "define organizations + define membership + connect user →
organization + assign initial owner" entry point.

## Organization boundary on every request

- `src/auth/services/headers.ts` sends `X-Org-Id` (and `X-User-Id`, `X-User-Role`)
  on every API call so the backend scopes queries to the caller's org.
- `src/common/tenancy/hooks/useTenant.ts` exposes `canAccess(targetOrgId)` for
  client-side guards; `src/common/tenancy/lib/tenant.ts` exposes
  `assertTenantBoundary(tenant, targetOrgId)` for server-side/route use.
- The **authoritative** boundary is the RLS policy in the migration:
  `using (org_id = public.current_org_id())` — a member can only see rows in
  the organization they belong to.

## Enforcing tenant isolation (server-side / database-side)

Apply `supabase/migrations/0001_multi_tenancy.sql`, then give **every** tenant-owned
resource table an `org_id` column plus the `current_org_id()` RLS policy (see the
`documents` example at the bottom of the migration). No INSERT/UPDATE/DELETE policies
are granted to `anon`; writes flow through the security-definer trigger or the
authenticated backend using the caller's org context.

## Test: Org A cannot access Org B

Run `supabase/migrations/0001_multi_tenancy.test.sql` in the Supabase SQL editor
(transactional). It simulates two authenticated users via `request.jwt.claims` and
asserts each org sees only its own rows, that the signup trigger assigns the owner
role, and that a cross-org read returns 0 rows.

Client-side, `src/common/tenancy/**/__tests__/*` unit-test the slug/normalization,
owner metadata, and the `useTenant.canAccess(...)` boundary guard.

## Ownership

- Frontend module owned by `src/common/tenancy/` (cross-feature → `common`).
- Backend/Supabase migration must be applied before this foundation is live.