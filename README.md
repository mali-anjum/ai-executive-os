# AI Executive OS

This repository is the **development workspace** for the AI Executive OS project. The codebase is split into **two independent repositories**:

## Repositories

| Repo | Description | Stack |
|------|-------------|-------|
| [`ai-executive-os-backend`](https://github.com/alianjum-web/ai-executive-os-backend) | FastAPI API, Celery workers, Supabase migrations, Docker Compose | Python, FastAPI, Celery, Supabase |
| [`ai-executive-os-frontend`](https://github.com/alianjum-web/ai-executive-os-frontend) | Next.js web application | Next.js 16, React 19, Redux, Tailwind |

## Local Development

Clone both repos side by side:

```bash
# Backend
git clone https://github.com/alianjum-web/ai-executive-os-backend.git
cd ai-executive-os-backend
cp .env.example .env.dev
pnpm run bootstrap

# Frontend (in a separate terminal)
git clone https://github.com/alianjum-web/ai-executive-os-frontend.git
cd ai-executive-os-frontend
cp .env.example .env.dev
pnpm install
pnpm run dev
```

## Architecture

```text
┌─────────────────┐     Supabase JWT      ┌──────────────────┐
│  frontend/      │ ────────────────────► │  backend/        │
│  Next.js :3000  │     POST /query/stream │  FastAPI :8000   │
└────────┬────────┘                       └────────┬─────────┘
         │                                           │
         │  NEXT_PUBLIC_API_URL                      │  DATABASE_URL
         ▼                                           ▼
                              ┌─────────────────────────────┐
                              │  PostgreSQL (pgvector)      │
                              │  local Docker :5433 or host │
                              └─────────────────────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │  Redis :6379            │
                              │  Celery worker (ingest) │
                              └─────────────────────────┘
```

## CI/CD

Each repository has its own independent CI/CD pipeline:

- **Backend**: `.github/workflows/ci.yml` + `.github/workflows/cd.yml`
  - CI: pytest, Pyright, Supabase migration check, Docker build
  - CD: GHCR image publish, production migrations, deploy webhook

- **Frontend**: `.github/workflows/ci.yml` + `.github/workflows/cd.yml`
  - CI: Jest, ESLint, TypeScript, Next.js build, Docker build
  - CD: GHCR image publish, Vercel deploy, E2E smoke tests