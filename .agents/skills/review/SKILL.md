---
name: review
description: After building a feature in the AI Executive OS frontend, verify it matches the plan, respects this repo's architecture and design standards, and is production ready. Reports issues clearly so the developer decides what to fix.
---

Building is not done when the code runs. It is done when the code is **correct** — matches the plan and respects this repo's architecture. AI moves fast and drifts: code that works on the surface but violates the module layout, the state rules, tenancy, RBAC, or the design system. This skill catches that before it compounds.

This skill does not fix anything. It reports findings and lets the developer decide.

## Step 1 — Understand What Should Have Been Built

Read in order: the `/architect` plan if one exists, the feature description, and the relevant context (`AGENTS.md`, `src/README.md`, `docs/tenancy/MULTI_TENANCY.md`, `docs/RTK/…`). You cannot verify correctness without knowing what correct looks like. If no plan exists, ask the developer to describe the feature first.

## Step 2 — Review in Three Layers

### Layer 1 — Does it match the plan?

Compare what was built against what was planned: every part of the feature present? decisions reflected? scope respected?

### Layer 2 — Does it respect the system?

Where AI drift most commonly happens. Check this repo's hard rules:

- **Module layout** — code in the right atomic folder (`atoms/ molecules/ organisms/ screens/ hooks/ state/ services/`); screens only import their module + `@/common/*`; `src/app/` only wires routes to screens.
- **State ownership** — server-owned data through RTK Query (`src/common/api/endpoints/<domain>.api.ts`), client-owned UI state in Redux slices. No duplicated server data in slices; no `useVisibilityPolling` alongside RTK Query polling for the same endpoint.
- **Hooks boundary** — no component imports `store/` or uses `useSelector`/`useDispatch` directly; it uses feature hooks (`useChat`, `useTickets`, `useTenant`, `useFeatureFlag`).
- **Tenancy** — org-aware resources guarded on the client by `useTenant().canAccess`; `X-Org-Id` / `X-User-Role` / `X-User-Id` headers present where needed (`src/auth/services/headers.ts`). Backend migrations/RLS never added here.
- **RBAC** — role gating via `RoleGuard` / `getRolePermissions`; roles `owner|admin|manager|employee`.
- **Type mirrors** — backend contract changes reflected in `src/common/types/http/` (`enums`, `schemas`, `errors`, `stream-events`).
- **Design system** — shadcn tokens in `common/atoms/ui/`; no hardcoded hex/raw color classes that bypass the palette (`common/lib/palette.ts`).
- **Naming** — PascalCase components/screens, camelCase `use*` hooks and `*Slice`, kebab-case folders, `*.service.ts` / `*.config.ts` for typed non-UI modules.

### Layer 3 — Is it production ready?

- Error handling — failures parsed via `ApiErrorResponse` / `getApiErrorMessage`, not silent.
- Loading/empty/error states — `LoadingBlock`, `EmptyState`, `ErrorState` used where a screen can be empty or fail.
- SSE chat — stream events parsed by `parseStreamSseEvent`; `token / error / done` handled, cleanup on unmount.
- Polling — visibility-aware, no overlapping requests, no duplicate polling.
- Edge cases — missing data, org boundary, role not allowed.

## Step 3 — Report What You Found

```
## Review — [Feature Name]

### Layer 1 — Plan alignment
[PASS / ISSUES FOUND] + list

### Layer 2 — System integrity
[PASS / ISSUES FOUND] + architecture/design/standard violations

### Layer 3 — Production readiness
[PASS / ISSUES FOUND] + error handling / edge cases / obvious bugs

### Summary
[X] issues across [Y] layers. Label each with severity.
```

## Step 4 — Let the Developer Decide

Stop after presenting the report. Do not fix anything or suggest fixes unless asked. The developer owns the quality decision; you inform it.

## Severity Guide

- **Critical — fix before moving on:** architecture boundary violations (e.g. store import in a component, server data in a slice, backend migration added to the frontend), missing error handling causing silent failures, planned functionality missing.
- **Important — fix soon:** design-system drift, naming/standard violations, edge cases real users hit.
- **Minor — fix when convenient:** non-behavioural inconsistencies, style nits.

## The Standard

The question this skill answers is not "does it work?" — it is "is it correct?" Working and correct are not the same thing. A feature can work today and break the project tomorrow. Review exists to catch the difference before it drifts.
