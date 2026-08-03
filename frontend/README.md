# Frontend — AI Executive OS

Next.js 16 web app for the AI Executive OS: Supabase authentication, RAG chat (SSE streaming), document library, command-center dashboard, tickets, and feature-flagged analytics.

**Backend repo:** [`ai-executive-os-backend`](https://github.com/alianjum-web/ai-executive-os-backend) — FastAPI API, Celery, Supabase migrations  
**Dev vs production env:** [`backend context/docs/DEV_VS_PRODUCTION.md`](https://github.com/alianjum-web/ai-executive-os-backend/blob/main/context/docs/DEV_VS_PRODUCTION.md)  
**Environment variables:** [`backend context/docs/ENVIRONMENT_VARIABLES.md`](https://github.com/alianjum-web/ai-executive-os-backend/blob/main/context/docs/ENVIRONMENT_VARIABLES.md)

---

## What this app does

| Area | Route / module | Description |
|------|----------------|-------------|
| **Auth** | `/login`, `/signup` | Supabase email/password; session synced to API via Bearer JWT |
| **Chat** | `/chat` | Streaming answers with citations (`POST /api/v1/query/stream`) |
| **Knowledge** | `/knowledge` | Upload and list documents (ingest → Celery on backend) |
| **Dashboard** | `/dashboard` | Command center, metrics, quick actions |
| **Tickets** | `/tickets` | Project-agent ticket feed (feature-flagged) |
| **Welcome** | `/` | Marketing / landing when unauthenticated |

The frontend talks to the FastAPI backend at `NEXT_PUBLIC_API_URL`. Auth tokens come from Supabase; the backend verifies JWTs and syncs org/user rows in Postgres.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|--------|
| **Node.js** | 18+ | Required for `pnpm` scripts |
| **pnpm** | 11.17.0 | Package manager (via `corepack`) |
| **Backend** | running on `:8000` | Start with the backend repo's README or `pnpm run dev` in the backend repo |
| **Supabase project** | — | Same project as backend `SUPABASE_URL` |

---

## Environment files

Two files — do not commit them (gitignored):

| File | Used by | Purpose |
|------|---------|---------|
| `.env.dev` | `pnpm run dev` | Local development (Docker Postgres backend, localhost API) |
| `.env.production` | `pnpm run prod` | Production-like test on your laptop (remote Supabase DB, pooler, prod keys) |

Copy the template once:

```bash
cp .env.example .env.dev
# Optional, for prod-mode testing:
cp .env.example .env.production
```

### Minimum `.env.dev`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-key from Supabase dashboard>
```

Use the **project root URL** for Supabase (`https://<ref>.supabase.co`) — not the Data API path `/rest/v1/`.

### Don't confuse: which file loads (frontend vs backend)

| App | How the file is chosen | Notes |
|-----|------------------------|--------|
| **Frontend** | `pnpm run dev` → `source .env.dev`; `pnpm run prod` → `source .env.production` | No `APP_ENV` on the frontend — only `NEXT_PUBLIC_*` vars. |
| **Backend** | `pnpm run dev` / `prod` set shell `ENV_FILE=.env.dev` or `.env.production` | See the backend repo's README: **`APP_ENV` does not switch files**. |

**Rule for both:** run `pnpm run dev` for local Docker + dev keys; run `pnpm run prod` for production-like URLs. Do not set `APP_ENV=production` in `.env.dev` and expect backend to read `.env.production`.

Monorepo explanation: [`backend context/docs/DEV_VS_PRODUCTION.md`](https://github.com/alianjum-web/ai-executive-os-backend/blob/main/context/docs/DEV_VS_PRODUCTION.md)

---

## First time only (new contributor)

**Frontend-only** (backend is a separate repo — clone and set it up first):

```bash
git clone <frontend-repo-url> ai-executive-os-frontend
cd ai-executive-os-frontend

cp .env.example .env.dev
# Edit .env.dev — same Supabase project as backend
pnpm install
```

**Backend** (separate repo — see [`ai-executive-os-backend`](https://github.com/alianjum-web/ai-executive-os-backend)):

```bash
git clone <backend-repo-url> ai-executive-os-backend
cd ai-executive-os-backend
cp .env.example .env.dev
# Edit .env.dev
pnpm run bootstrap
```

---

## Every day — local development

### One command (this folder)

```bash
pnpm run dev
```

Loads `.env.dev` and runs Next.js on **http://localhost:3000**.  
Backend must already be up (run `pnpm run dev` in the backend repo).

---

## Test production-like behavior (on your laptop)

Uses remote Supabase database and production env files (no local Docker Postgres for the API).

### One command (this folder)

```bash
pnpm run prod
```

Fill `.env.production` first (see [`backend context/docs/SUPABASE_REMOTE_DATABASE.md`](https://github.com/alianjum-web/ai-executive-os-backend/blob/main/context/docs/SUPABASE_REMOTE_DATABASE.md)).  
Typical test URL: still **http://localhost:3000** with `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` while the backend runs locally against the remote DB.

### Production build (deploy-style check)

```bash
pnpm run build:prod    # uses .env.production
pnpm run start:prod
```

---

## How to verify it works

| Step | Check |
|------|--------|
| 1 | `pnpm run dev` → http://localhost:3000 loads |
| 2 | Sign in / sign up (Supabase) |
| 3 | Open **Chat** — message streams (backend :8000 + valid LLM key) |
| 4 | Open **Knowledge** — upload if `DOCUMENT_UPLOAD_ENABLED` in backend features |

```bash
curl -s http://127.0.0.1:8000/api/v1/health
```

---

## pnpm scripts

| Command | When to use |
|---------|-------------|
| `pnpm install` | First time in `frontend/` |
| `pnpm run dev` | Daily — dev UI with `.env.dev` |
| `pnpm run prod` | Daily — prod-like UI with `.env.production` |
| `pnpm run build` | Production build (`.env.dev`) |
| `pnpm run build:prod` | Production build (`.env.production`) |
| `pnpm run start` / `start:prod` | Serve built app |
| `pnpm run lint` | ESLint |
| `pnpm test` | Jest unit tests |
| `pnpm run test:e2e` | Playwright |

---

## Project structure

```text
frontend/
├── src/
│   ├── app/              # Next.js App Router — routes only (thin pages)
│   ├── proxy.ts          # Request gate: session, login ↔ app redirects
│   ├── auth/             # Login, signup, AuthProvider, auth services
│   ├── chat/             # Chat UI, SSE hook, citations
│   ├── dashboard/        # Command center, metrics charts
│   ├── knowledge/        # Document library + upload
│   ├── tickets/          # Ticket feed + hooks
│   ├── welcome/          # Landing / marketing
│   └── common/           # Shared atoms, layout, Redux, API + Supabase clients
├── public/
├── .env.example          # Template → copy to .env.dev / .env.production
├── eslint.config.mjs
├── jest.config.js
└── package.json
```

### Feature modules (atomic design)

Each feature folder under `src/` follows the same layers:

| Layer | Role | Examples |
|-------|------|----------|
| `atoms/` | Smallest UI | `Button`, shadcn `ui/*` |
| `molecules/` | Composed pieces | `ChatBubble`, `ErrorState` |
| `organisms/` | Page sections | `ChatWindow`, `AppShell` |
| `screens/` | Full page composition | `ChatScreen`, `LoginScreen` |
| `hooks/` | Data + Redux adapters | `useChat`, `useTickets` |
| `state/` | Redux slices | `chatSlice` |
| `services/` | Module-specific API (optional) | `auth/services/` |

**`common/`** holds anything shared across two or more features: layout shell, theme, feature flags, Supabase client, API client, root Redux store.

Deeper layout notes: [`src/README.md`](src/README.md) · [`src/common/README.md`](src/common/README.md)

### Core files (start debugging here)

| File | Role |
|------|------|
| [`src/proxy.ts`](src/proxy.ts) | Next.js 16 edge gate — protected routes, auth redirects |
| [`src/auth/organisms/AuthProvider.tsx`](src/auth/organisms/AuthProvider.tsx) | Supabase session in React |
| [`src/auth/services/auth.service.ts`](src/auth/services/auth.service.ts) | Login/signup/logout; Bearer token for API |
| [`src/common/services/supabase/client.ts`](src/common/services/supabase/client.ts) | Browser Supabase client |
| [`src/common/services/api/client.ts`](src/common/services/api/client.ts) | Typed fetch to FastAPI |
| [`src/app/layout.tsx`](src/app/layout.tsx) | Root layout, providers, theme |

Full three-file map (frontend + backend): [`backend context/docs/CORE_FILES.md`](https://github.com/alianjum-web/ai-executive-os-backend/blob/main/context/docs/CORE_FILES.md)

---

## Tech stack

- **Next.js 16** (App Router, `proxy.ts` for auth routing)
- **React 19**
- **Redux Toolkit** — global UI/user/org state; feature slices in modules
- **Supabase SSR** (`@supabase/ssr`) — cookies + session refresh
- **Tailwind CSS 4** + shadcn-style components under `common/atoms/ui/`
- **Recharts** — analytics dashboard

---

## Static typing (TypeScript)

Contracts mirror the backend under [`src/common/types/http/`](src/common/types/http/) (`enums`, `schemas`, `errors`, `stream-events`). HTTP calls go through [`src/common/api/`](src/common/api/) and parse `ApiErrorResponse` on failures.

```bash
pnpm run typecheck              # tsc --noEmit (strict)
```

When you change a backend Pydantic model, update the matching file in `src/common/types/` before merging.

---

## Tests and quality

```bash
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run test:e2e   # requires app running; see playwright config
```

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [`backend context/docs/PROJECT_MASTER.md`](https://github.com/alianjum-web/ai-executive-os-backend/blob/main/context/docs/PROJECT_MASTER.md) | Engineering spec and conventions |
| [`backend context/docs/CORE_FILES.md`](https://github.com/alianjum-web/ai-executive-os-backend/blob/main/context/docs/CORE_FILES.md) | Where auth, RAG, and tenant sync live |
| [`backend context/docs/FEATURE_FLAGS.md`](https://github.com/alianjum-web/ai-executive-os-backend/blob/main/context/docs/FEATURE_FLAGS.md) | Flags served from backend `config/features.json` |

---

## Quick reference

| Goal | Command |
|------|---------|
| **First time** | `cp .env.example .env.dev` → edit → `pnpm install` |
| **Daily dev** | `pnpm run dev` |
| **Prod-like test** | `pnpm run prod` |
| **Typecheck** | `pnpm run typecheck` |