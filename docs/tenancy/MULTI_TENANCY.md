# Multi-Tenancy Foundation

Two layers, **one owner each**:

- **Database schema / migrations — owned by the BACKEND repo only.**
  Source of truth: `ai-executive-os-backend/supabase/migrations/` (a real Supabase
  CLI project — has `config.toml`; its `supabase/README.md` states *"Single source of
  truth for schema changes"*). This frontend repo does **not** host migrations.
- **Client tenancy — owned by this repo**, under `src/common/`:
  `types/tenancy.ts`, `lib/tenant.ts`, `hooks/useTenant.ts` (+ their tests).

> The earlier draft put a `supabase/migrations/` folder in the frontend. That was
> removed — see [Ownership](#ownership), which is the whole point of this doc.

## Goal

Every authenticated user belongs to exactly one **organization (tenant)**. Every
tenant-owned resource has an organization boundary, and isolation is enforced by the
**database** (RLS) on the backend, never only by client code. This prevents Org A from
reading or mutating Org B's data even if a request is forged.

## Domain model (matches the backend)

| Entity | Field | Notes |
|--------|-------|-------|
| `organizations` | `id` (uuid, PK) | The tenant |
| | `name` | display name |
| | `plan` / `settings_json` | billing + settings |
| `users` | `id`, `email` | |
| | `org_id` | membership link (user → tenant) |
| | `role` | `owner` \| `admin` \| `manager` \| `employee` |

Membership is modeled by `users.org_id` + `users.role` — **not** a separate
`organization_members` join table. The frontend mirrors the role enum in
`src/common/types/tenancy.ts`; `OrgRole` drives `src/auth/hooks/getRolePermissions.ts`
(an `owner` is treated as admin/leadership).

## Signup flow (frontend → Supabase)

1. The signup form collects the four fields: **email, full name, password,
   organization name** (`src/auth/services/form-resolvers.ts`).
2. `SignupScreen` / `CompleteProfileScreen` call
   `buildOrganizationMetadata(...)` (`src/common/lib/tenant.ts`), producing
   `org_id`, `org_name`, `org_slug`, `role: "owner"` (+ `full_name`).
3. That block is passed to Supabase as the user's `user_metadata`.
4. The backend's RLS reads this metadata via `auth_org_id()` / `auth_user_role()`
   (see `0007_row_level_security.sql`) to scope every query to the caller's tenant.

## Organization boundary on every request

- `src/auth/services/headers.ts` sends `X-Org-Id` (and `X-User-Id`, `X-User-Role`)
  on every API call so the backend scopes queries to the caller's org.
- `src/common/hooks/useTenant.ts` exposes `canAccess(targetOrgId)` for client-side
  guards; `src/common/lib/tenant.ts` exposes `assertTenantBoundary(tenant, targetOrgId)`
  for server-side/route use.
- The **authoritative** boundary is RLS on the backend:
  `using (org_id = public.auth_org_id())` — a member only ever sees rows in the org
  they belong to.

## Enforcing tenant isolation (server-side / database-side)

Owned by the backend repo. Its `0002_organizations_multitenant.sql` adds
`org_id` scoping; `0007_row_level_security.sql` turns on RLS on every tenant table
(`organizations`, `users`, `documents`, `document_chunks`, `queries`, `tickets`,
`assignee_mappings`, `activity_logs`, `org_integrations`, `connector_syncs`), each
scoped through `auth_org_id()`.

**Rule:** every new tenant-owned table added in the backend must include an `org_id`
column + an `auth_org_id()` RLS policy.

## Test: Org A cannot access Org B

- **Database-level (authoritative, backend):** the RLS policies in
  `0007_row_level_security.sql` scope every row by `auth_org_id()`, which is derived
  from the caller's JWT `user_metadata.org_id` — a forged cross-org read returns 0 rows.
  Keep DB isolation tests in the **backend** repo's test suite.
- **Client-level:** `src/common/lib/__tests__/tenant.test.ts` (normalize/slug/tenant
  boundary) and `src/common/hooks/__tests__/useTenant.test.ts`
  (`useTenant.canAccess` — Org A ≠ Org B).

## Ownership

- **Migrations/database: the backend repo only** (`ai-executive-os-backend/
  supabase/migrations/`). Do not add migrations to this frontend repo.
- **Client tenancy: this repo** (`src/common/types/tenancy.ts`,
  `src/common/lib/tenant.ts`, `src/common/hooks/useTenant.ts`).
- If org features are needed beyond what the backend has today (e.g. a unique
  `org_slug`, an explicit membership table, an `on_auth_user_created` owner trigger),
  add them as a **new timestamped migration in the backend repo** — never here, and
  never in two places.
