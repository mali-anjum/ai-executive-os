---
name: imprint
description: After building any UI component in the AI Executive OS frontend, extract the visual patterns that matter for consistency and save them to ui-registry.md. So every component built after this one matches what came before.
---

UI consistency does not happen by accident. Each AI-built component is built in isolation and the agent does not remember what it built three sessions ago — so spacing drifts, colors vary, radius is inconsistent. This skill fixes that. Run it after building any UI component.

## Project Grounding — this repo's design system

- **Framework:** Tailwind CSS 4 + shadcn-style primitives under `src/common/atoms/ui/` — `button`, `badge`, `card`, `input`, `separator`, `skeleton`, `sonner`.
- **Composable atoms** also exist in `src/common/atoms/` (`Button`, `Badge`, `Input`, `LogoMark`, `Logo`, `ThemeToggle`).
- **Tokens / palette:** `src/common/lib/palette.ts` and `src/common/lib/theme.ts` (with `next-themes`). Design tokens such as `bg-background`, `text-foreground`, `text-muted-foreground`, `text-muted`, `border`, `rounded-lg` are the vocabulary — not raw hex values or ad-hoc arbitrary Tailwind classes.
- Naming: PascalCase component files; shadcn `ui/` files kebab-case.

**Register at `ui-registry.md` in the project root.**

## How to Invoke

- `/imprint` — capture from the most recently built component(s)
- `/imprint [filepath]` — capture from a specific file
- `/imprint audit` — scan the whole codebase and establish a baseline

Run `/imprint audit` before first use on any project where the UI was not tracked from the beginning (this repo already has lots of existing UI, so an audit is the right first pass).

## Step 1 — Find What Was Just Built

If a filepath was given, read it. Otherwise identify the component files most recently created/modified this session under `src/<module>/` and `src/common/`. If unclear, ask which component to capture.

## Step 2 — Extract What Matters for Consistency

Read the component. Extract only the classes/values that affect cross-interface consistency, mapped to this repo's shadcn/token vocabulary:

- Background — `bg-*` used for container/cards/panels (prefer tokens like `bg-card`, `bg-background`).
- Border — border color/width/style (prefer `border` token).
- Border radius — `rounded-*` (prefer `rounded-md`/`rounded-lg`).
- Text colors — primary/secondary/muted (`text-foreground`, `text-muted-foreground`, `text-muted`).
- Text sizes/weights — headings, body, labels, captions.
- Spacing — padding and gaps.
- Interactive states — hover/focus/active.
- Shadow and any accent/brand color usage.

Do not extract layout (width/height, flex/grid, positioning) or animation timing — too context-dependent to be a consistency rule.

## Step 3 — Write to ui-registry.md

Open `ui-registry.md` (create if missing). Append a new entry for the captured component — never overwrite existing entries. For each entry record how the component **maps to this repo's tokens** (e.g. `Button primary → bg-primary text-primary-foreground rounded-md`) and note any component that bypasses the design system (raw hex, arbitrary `[color]`, hardcoded Tailwind).

## Audit Mode (`/imprint audit`)

Establish a clean baseline before further capturing. Scan every component under `src/`, read each, and report conflicts per property:

```
## UI Consistency Audit

### Conflicts found
Border radius: [every rounded- variant + recommendation]
Background colors: [every bg- class; flag hardcoded hex] + token to use
Text colors: [every text- class; flag non-token] + token to use
Spacing / borders / interactive states: [variations + recommendation]

### Hardcoded values found
[every raw hex / arbitrary class, with file and line] — replace with tokens

### Recommended baseline
[the correct token pattern for each property]
```

Present the audit and wait for confirmation — do not fix anything and do not update `ui-registry.md` yet. After confirmation, write the agreed baseline to `ui-registry.md` labelled `## Baseline — Established [date]`, then list every component that deviates so the developer can fix them systematically.

## Hard Rules — Must Never Violate

**Reuse existing UI before creating new visual patterns (no duplicate components).**
Before capturing or building anything, check that the needed primitive already exists:

- shadcn primitives in `common/atoms/ui/`: `button`, `badge`, `card`, `input`, `separator`,
  `skeleton`, `sonner`.
- Composable atoms in `common/atoms/`: `Button`, `Badge`, `Input`, `Logo`, `LogoMark`,
  `ThemeToggle`.
- Molecules in `common/molecules/`: `EmptyState`, `ErrorState`, `LoadingBlock`,
  `AIProcessingBanner`.

If a component already covers the need, **use it** — do not create a second one and do not
capture it as a brand-new pattern. This skill exists to keep components consistent, not to
multiply them.

**Design-system rules:**
1. Use the tokens and shadcn primitives — no hardcoded hex, no arbitrary/raw Tailwind color
   classes that bypass `lib/palette.ts` and `lib/theme.ts`.
2. Standardise on the repo's radius/spacing/text tokens (`bg-card`, `text-muted-foreground`,
   `rounded-md`/`rounded-lg`, etc.) rather than ad-hoc values.
3. If the same visual pattern appears in multiple components, register it once in
   `ui-registry.md` and reference it — never redefine it per component.
4. Run `/imprint audit` before establishing `ui-registry.md` on this existing codebase, and
   flag every component that deviates from the agreed baseline.

