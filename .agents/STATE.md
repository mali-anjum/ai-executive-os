# STATE — single source of truth (frontend repo)

> **The one living file every session reads and updates.** Do **not** create
> sibling memory/state files (`memory.md`, `session.md`, …). Update **this same
> file**: refresh **Current**, append to **Sprint Ledger**, grow **Decisions &
> foundations**, and keep everything **condensed** — prune superseded entries so
> this stays the whole truth, not a transcript.
>
> Read this at the start of every session (`/remember restore`); update it at the
> end (`/remember save`). Secrets never go here — reference `.env.*` file names only.

## Current (latest sprint — refresh each session)

**Sprint 4 — Organization & Multi-Tenant Onboarding (frontend).** Built, **not committed**.

- New **`src/org/` module** (atomic design per `src/README.md`):
  - `hooks/useOrgData.ts`, `hooks/useTeam.ts`, `hooks/useAcceptInvitation.ts`.
  - `screens/OnboardingScreen.tsx` (owner onboarding, integrations skippable),
    `screens/TeamScreen.tsx`, `screens/OrgSettingsScreen.tsx` (gated `useRole().isAdmin`).
  - `molecules/InviteMembersForm.tsx`, `molecules/InvitationList.tsx`,
    `molecules/MemberList.tsx`; `organisms/AcceptInvitationCard.tsx`.
  - `services/invitation-validation.ts` (+ test) — pure mirror of backend RBAC.
- **Org data access = RTK Query over Supabase** — `src/org/` hooks (`useOrgData`,
  `useTeam`, `useAcceptInvitation`) consume `src/common/api/endpoints/org.api.ts`,
  whose `queryFn` endpoints call supabase-js (PostgREST + RLS). Supabase stays the
  transport (no FastAPI org CRUD); RTK Query owns caching/invalidation/polling so
  org data follows the same server-state rule as every other feature.
- **Type mirrors** — `UserRole` gained `owner`; `InvitationStatus` added in
  `src/common/types/http/enums.ts`; org/invitation/member/settings types added in
  `src/common/types/http/schemas.ts` (kept in sync with backend `schemas.py`).
- **Routes** — `src/app/onboarding/page.tsx`, `src/app/team/page.tsx`,
  `src/app/settings/page.tsx`. `AcceptInvitationCard` mounted on dashboard for
  non-admin users.
- **Role-aware nav** — `src/common/lib/navigation.ts` secondaryNav: `Team`
  (`/team`) + `Organization settings` (`/settings`), both admin-only + flag
  `ORG_MANAGEMENT_ENABLED`; `src/common/organisms/layout/AppSidebar.tsx` handles it.
- **Flag** — `ORG_MANAGEMENT_ENABLED` in `src/common/config/features.config.ts`.

### Current state flags
- **All Sprint 4 changes are UNCOMMITTED.**
- **DECISION (2026-08-18): Supabase-native org layer, wrapped in RTK Query.**
  Org context/members/invitations/settings/onboarding are read+written via
  **supabase-js (PostgREST + RLS)** but through RTK Query `queryFn` endpoints
  (`org.api.ts`) — never a Redux slice. Invitation accept calls the
  `accept_org_invitation()` SECURITY DEFINER RPC, then the client syncs
  `user_metadata` (what RLS reads). FastAPI stays for knowledge/RAG, tickets,
  analytics, integrations only.
- **Migration applied in code:** FastAPI org endpoints (`orgs.py`,
  `organization_service.py`) + frontend `org.api.ts` + org tags/types were
  removed; `src/org/` hooks talk to Supabase directly. Backend migrations
  `0009` + `0010` still need `pnpm run db:migrate` to be applied to a running DB.

## Sprint Ledger (append-only, condensed — newest on top)

### Sprint 4 — Organizations & multi-tenancy (frontend)
- `src/org/` module: onboarding, team/invitations, org settings, accept-invite.
- RTK Query `org.api.ts` + type mirrors (`owner` role, invitation types).
- Role-aware nav (Team, Organization settings, admin-only) + `ORG_MANAGEMENT_ENABLED` flag.

### Sprint 3 & earlier (foundation — unchanged)
- Next.js 16 App Router + React 19 + Redux Toolkit/RTK Query + Tailwind 4 + Supabase
  SSR. Modules: `auth`, `chat`, `dashboard`, `knowledge`, `tickets`, `welcome`.
  Common tenancy: `types/tenancy.ts`, `lib/tenant.ts`, `hooks/useTenant.ts`,
  `auth/hooks/getRolePermissions.ts`, `auth/services/headers.ts`, `RoleGuard`.

## Decisions & foundations (grow, rarely change — the long-lived truth)
- Server-owned **org** data (organizations, `users.org_id/role`, invitations) is
  read + written via **supabase-js (PostgREST + RLS)** through RTK Query
  `queryFn` endpoints (`org.api.ts`) — never a Redux slice and never a second
  FastAPI endpoint. Other server data (documents, tickets, analytics, knowledge)
  goes through **RTK Query** `fetchBaseQuery` endpoints. Client-owned UI state →
  Redux slices. Redux lives behind hooks (`useChat`, `useTickets`, `useTenant`,
  `useOrg`, `useUser`, …); components never import `store/` or call
  `useSelector`/`useDispatch` directly.
- New module **`src/org/` owns** the org/team hooks (one module owns a hook/service;
  other modules import from there). Screens import only their module + `@/common/*`.
- Tenancy/RBAC guards via `useTenant().canAccess` / `useRole().isAdmin` (client
  visibility only — authoritative enforcement is backend `require_admin` + RLS).
  Roles: owner > admin > manager > employee; owner treated as admin in
  `getRolePermissions`.
- Invitation accept: client calls `supa.rpc("accept_org_invitation", …)`, then
  `authService.updateUserMetadata({org_id, org_name, org_slug, role})` so RLS
  (`auth_org_id()`/`auth_user_role()`) reads the new tenant. Always sync
  `user_metadata` after accept; never trust a frontend-supplied org id.
- Supabase migrations/schema/RLS are **backend-owned** — never added here.
- Type mirrors in `src/common/types/http/` map 1:1 to backend `app/models/http/*`;
  update both together and run `tsc --noEmit`.
- Design system: shadcn primitives in `common/atoms/ui/` + tokens in
  `common/lib/palette.ts`/`theme.ts`; no raw hex / ad-hoc classes.
- **DECISION (2026-08-18) — Supabase-native org layer, wrapped in RTK Query.**
  Org context/members/invitations/settings/onboarding are read+written via
  **supabase-js (PostgREST + RLS)** — never duplicated into a Redux slice and
  never a second FastAPI endpoint — but they go through RTK Query `queryFn`
  endpoints (`org.api.ts`) for caching/dedup/invalidation/polling parity with
  the FastAPI endpoints. Invitation accept calls the `accept_org_invitation()`
  SECURITY DEFINER RPC (a client must never set its own `org_id`/`role`); the RPC
  returns the resulting org/role and the client immediately syncs `user_metadata`
  so RLS picks it up. FastAPI keeps only LLM/RAG/tickets/analytics/integrations.
  One row-level authority (RLS) protects every org-owned row.

## Next session starts with
1. Apply backend migrations `0009` + `0010` + `0011` (`pnpm run db:migrate`) and
   verify `handle_new_user` (signup bootstrap) + `accept_org_invitation()` RPC.
2. Finish the invitation-accept entry point: `AcceptInvitationCard` now reads the
   invited org id from `?org=<org_id>`; the remaining piece is generating that
   link from the invitation `token` (an invite email/link endpoint) so a new user
   can be routed to `/dashboard?org=<id>`.

## Open questions
- (Resolved) FastAPI org endpoints vs Supabase-native org layer → **Supabase-native.**
- Invitation accept still needs the client to sync `user_metadata`; confirm no
  window where a user can act in two orgs simultaneously (RLS scopes every read).

## Hard rules (inherit every session)
- Never persist secrets (.env.*). Supabase migrations/schema/RLS are
  **backend-owned** — never added here. Redux lives behind hooks; components
  never import `store/` or call `useSelector`/`useDispatch` directly. No server
  data in Redux slices (use RTK Query). Design tokens only (no raw hex). Screens
  import only their module + `@/common/*`. Reuse existing hooks/endpoints/
  components before creating new ones (see `remember` skill + `imprint` registry).

