# Agent Instructions — AI Executive OS (frontend)

You are working in the **frontend repo of AI Executive OS** (`ai-executive-os`):
Next.js 16 (App Router) + React 19 + Redux Toolkit + RTK Query + Supabase SSR +
Tailwind CSS 4. The backend is a **separate private repo** (FastAPI / Celery /
Supabase). Read this file first and comply with every rule below — never write
code that violates these boundaries.

**Before coding:** Read [src/README.md](src/README.md) (module layout),
[docs/tenancy/MULTI_TENANCY.md](docs/tenancy/MULTI_TENANCY.md) (tenancy
boundaries, backend-owned migrations), and
[docs/RTK/rtk polling and visibality polling.md](docs/RTK/rtk%20polling%20and%20visibality%20polling.md)
(server-state vs client-state rules). The backend engineering spec lives in the
separate `ai-executive-os-backend` repo.

## Golden rules (never break)

1. **Frontend only.** Supabase migrations, database schema, and RLS are owned by
   the **backend repo** — never add them here.
2. **Redux Toolkit lives behind hooks.** Components must never import `store/` or
   call `useSelector` / `useDispatch` directly. Use feature hooks (`useChat`,
   `useTickets`, `useTenant`, `useOrg`, `useUser`, `useSidebar`, `useFeatureFlag`).
3. **State ownership:** *server-owned data → RTK Query* (endpoints under
   `src/common/api/endpoints/`); *client-owned UI state → Redux slice*. Never
   duplicate server data into a slice, and never combine RTK Query polling with
   `useVisibilityPolling` for the same endpoint.
4. **Type mirrors:** `src/common/types/http/` (`enums`, `schemas`, `errors`,
   `stream-events`) mirrors backend Pydantic models. When a backend model changes,
   update the mirror and run `pnpm run typecheck`.
5. **Tenancy + RBAC:** every org-owned resource is guarded by `useTenant().canAccess`
   on the client (authoritative enforcement is backend RLS). `X-Org-Id` /
   `X-User-Role` / `X-User-Id` headers come from `src/auth/services/headers.ts`.
   Roles are `owner | admin | manager | employee`; gate UI with `RoleGuard` /
   `getRolePermissions`.
6. **Design system:** use the shadcn primitives in `src/common/atoms/ui/` and the
   tokens in `src/common/lib/palette.ts` + `lib/theme.ts`. No hardcoded hex or raw
   color classes that bypass the tokens.

## Module layout (atomic design)

Each feature is a top-level folder under `src/<module>/`:

| Layer | Role |
|-------|------|
| `atoms/` | Smallest UI (Button, Badge, shadcn `ui/*`) |
| `molecules/` | Composed pieces (ChatBubble, TicketRow, ErrorState) |
| `organisms/` | Page sections (ChatWindow, AppShell, RoleGuard) |
| `screens/` | Full page (module + `@/common/*` only) |
| `hooks/` | Data + Redux/API adapters (`use*`) |
| `state/` | Redux slices + selectors (`*Slice`) |
| `services/` | Module-owned integrations (optional) |

- `src/app/` only wires routes to module **screens** — no logic, no store imports.
- Shared cross-feature code lives in `src/common/` (`atoms`, `molecules`,
  `organisms`, `hooks`, `state/slices`, `store`, `services`, `api`, `lib`,
  `types`, `config`). There is no `src/lib` or `src/config`.
- Screens import only their module + `@/common/*`; they never import
  `@/common/store` directly.
- One module owns a hook/service; other modules may import it (e.g.
  dashboard → `@/tickets/hooks/useTickets`).

## Naming

- PascalCase for component/screen files.
- camelCase for hooks (`use*`) and Redux slices (`*Slice`).
- kebab-case for module/route folders and shadcn `ui/` files.
- `*.service.ts` / `*.config.ts` for typed non-UI modules.

## Feature flags

Toggle new/hidden features through the `FEATURE_FLAGS` map in
`src/common/config/features.config.ts` via the `useFeatureFlag` hook — do not
half-ship a feature with ad-hoc conditionals.

## Quality checks (must pass before finishing)

```bash
pnpm run typecheck   # tsc --noEmit (strict)
pnpm run lint        # eslint
pnpm test            # jest unit tests
pnpm run test:e2e    # playwright (requires app running)
```

Local dev is `pnpm run dev` (sources `.env.dev`); production-like is
`pnpm run prod` (sources `.env.production`). Never capture or commit env secrets.

## Skills (in `.agents/skills/`)

Repo-specific runbooks — invoke with `/architect`, `/recover`, `/remember`,
`/review`, `/imprint`. Use `/remember save` at the end of every session and
`/remember restore` at the start of the next so nothing is lost between sessions.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all
differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

