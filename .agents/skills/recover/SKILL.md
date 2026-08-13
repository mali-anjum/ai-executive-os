---
name: recover
description: When something goes wrong during a build in the AI Executive OS frontend, diagnose what type of failure it is before deciding how to respond. Targeted fix, hard reset, or full rethink — the right response depends on the right diagnosis.
---

Not every problem is a bug. Not every bug needs debugging. In AI-assisted development the instinct is to keep prompting — describe the problem, ask for a fix, get another broken version, repeat. The session gets longer, the context gets polluted, the code gets worse. This skill diagnoses first, then prescribes the right response. Those are two separate steps and cannot be swapped.

## Project Grounding — the common ways this repo goes wrong

This codebase has a handful of recurring failure patterns. Knowing them helps you diagnose fast:

- **Wrong-layer code.** UI logic in an API route, DB/data logic in a component, or files placed under the wrong atomic folder. E.g. a store import (`@/.../store`) inside a component instead of going through a hook.
- **Server state in a Redux slice.** Documents/tickets/analytics copied into a slice instead of RTK Query — a second source of truth ([`docs/RTK/…`](../docs/RTK/rtk%20polling%20and%20visibality%20polling.md)).
- **Backend-owned work added to the frontend.** Supabase migrations, schema, or RLS written into **this** repo. Those belong only in the backend repo ([`docs/tenancy/MULTI_TENANCY.md`](../docs/tenancy/MULTI_TENANCY.md)).
- **Broken tenancy / auth headers.** Missing `X-Org-Id` / `X-User-Role` / `X-User-Id` on an API call (`src/auth/services/headers.ts`), or a component reaching past `useTenant().canAccess`.
- **Type-mirror drift.** A backend Pydantic model changed but `src/common/types/http/*` still has the old shape.
- **Hardcoded design values.** Raw hex colors or ad-hoc Tailwind classes instead of the shadcn/design tokens in `common/atoms/ui/`.

## Step 1 — Describe What Went Wrong

Listen first. Ask:

```
Describe what is wrong. Be specific:
- What did you expect to happen?
- What happened instead?
- How many times have you tried to fix it already?
- Which module/file is involved?
```

## Step 2 — Identify the Failure Mode

### Failure Mode 1 — A specific thing is broken
**Signs:** isolated, the rest of the app works, first/second attempt, clear error.
**What it means:** a normal bug with a root cause. **Response:** Targeted fix — Step 3A.

### Failure Mode 2 — The session has gone wrong
**Signs:** multiple attempts made things worse, fixes patching fixes, polluted context, unclear what the original problem was.
**What it means:** the session is polluted; more prompting compounds the damage. **Response:** Hard reset — Step 3B.

### Failure Mode 3 — The foundation is wrong
The implementation itself misunderstands the architecture.
Signs include:

- Code placed in the **wrong repo** (e.g. a migration added to the frontend).
- A component importing `store/` directly or bypassing feature hooks.
- Server state dumped into a Redux slice when an RTK Query endpoint already exists.
- An HTTP call written as a raw `fetch()` instead of through the typed client/hook layer.
- A backend contract change that did not update the type mirror. Fixing pieces will not help — the approach is wrong.

**Response:** Rethink — Step 3C.

Tell the developer which mode this is before proceeding:

```
This looks like Failure Mode [1/2/3] — [name].

[One sentence explaining why.]

Here is how we handle this:
```

## Step 3A — Targeted Fix

For Failure Mode 1. Diagnose before touching code — share the exact error or wrong behaviour, then the file and the contract (endpoint, hook, slice) involved. Identify the root cause and propose a minimal fix:

```
Root cause: [what is actually wrong and where]
Fix: [the smallest change that resolves it and why]
```

Wait for confirmation before changing anything. If the fix does not work, stop and re-diagnose the root cause — it was probably wrong. After two wrong root-cause diagnoses, re-evaluate: this may actually be Failure Mode 2 or 3.

## Step 3B — Hard Reset

For Failure Mode 2. Acknowledge honestly that a fresh start beats continuing in a polluted context. Save what is worth keeping as a reset note:

```
## Reset Note — [Feature Name]

### What we were building
[Original feature description]

### What went wrong
[Honest summary]

### What to avoid next time
[Specific patterns that failed — e.g. wrong module layer, fetch instead of hook, server data in a slice]

### Starting point for next session
[What to keep, what to discard]
```

Then instruct the developer: save the note, end this session, start fresh, `/remember restore` if memory exists, and re-approach with the reset note as context. Do not continue in this session.

## Step 3C — Rethink

For Failure Mode 3. The approach is wrong, not a bug. Name the wrong assumption in this repo's terms:

```
The core issue is not a bug — it is a wrong assumption:

Assumed: [what was assumed]
Reality: [what is actually true in this codebase]

This means the current implementation cannot be fixed by patching.
The approach needs to change.
```

Propose the correct approach (correct module layer, use the hook/endpoint, keep backend-owned work out of the frontend), say what must be discarded and what can be kept, and wait for confirmation before rebuilding.

## The Principle

The worst thing you can do when something is broken is keep doing the same thing faster. Diagnose first. Respond correctly — and in this repo, make sure fixes respect the module layout, the state rules, the tenancy boundary, and the type mirrors.
