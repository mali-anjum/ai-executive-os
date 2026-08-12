-- =============================================================================
-- Multi-Tenancy Foundation — server-side / database-side isolation
-- =============================================================================
-- Apply this to the SAME Supabase project the backend uses.
-- Pair with `0001_multi_tenancy.test.sql` to verify Org A cannot read Org B.
--
-- The frontend writes `org_id`, `org_name`, `org_slug`, `role` (+ `full_name`)
-- into the user's `user_metadata` at signup (see
-- `src/common/tenancy/services/tenancy.service.ts`). This migration reads that
-- metadata and materializes the real `organizations` + `organization_members`
-- rows so isolation is enforced by the database, never only by client code.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Organizations (the tenant)
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) >= 2),
  slug       text not null unique
             check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Organization membership (user -> organization, with a role)
-- ---------------------------------------------------------------------------
create table if not exists public.organization_members (
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('owner','admin','manager','employee')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 3. Tenant helper (used by RLS policies and the trigger)
-- ---------------------------------------------------------------------------
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id
  from public.organization_members
  where user_id = auth.uid()
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- 4. Row-Level Security — every tenant-owned row is scoped to the caller's org
-- ---------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Members may select the organization they belong to (and nothing else).
create policy "organizations: members select own organization"
  on public.organizations
  for select
  using (
    exists (
      select 1
      from public.organization_members m
      where m.org_id = organizations.id
        and m.user_id = auth.uid()
    )
  );

-- Members may read membership of their own organization only.
create policy "organization_members: members select own org membership"
  on public.organization_members
  for select
  using (org_id = public.current_org_id());

-- No INSERT/UPDATE/DELETE policies for anon: only the security-definer
-- trigger (below) and authenticated owners/admins (via backend) may write.

-- ---------------------------------------------------------------------------
-- 5. Assign initial owner role during signup (trigger on auth.users)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_org_name text;
  v_org_slug text;
  v_role text;
begin
  v_org_id := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'org_id', '')), '')::uuid,
    gen_random_uuid()
  );
  v_org_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'org_name', '')), '');
  v_org_slug := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'org_slug', '')), ''),
    'org-' || substr(replace(v_org_id::text, '-', ''), 1, 12)
  );
  v_role := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'role', '')), ''),
    'owner'
  );

  if v_role not in ('owner','admin','manager','employee') then
    v_role := 'owner';
  end if;

  -- Create the organization (idempotent for pre-provisioned ids).
  insert into public.organizations (id, name, slug)
  values (v_org_id, coalesce(v_org_name, 'Organization'), v_org_slug)
  on conflict (id) do nothing;

  -- Connect the authenticated user to the organization with the owner role.
  insert into public.organization_members (org_id, user_id, role)
  values (v_org_id, new.id, v_role)
  on conflict (org_id, user_id) do update set role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 6. Organization boundary on every tenant-owned resource (example)
-- ---------------------------------------------------------------------------
-- Every existing/future resource table must carry `org_id` and a matching RLS
-- policy. Example for the `documents` table (adjust to actual table names):
--
--   alter table public.documents
--     add column if not exists org_id uuid
--       references public.organizations(id) on delete cascade;
--
--   create policy "documents: tenant isolation"
--     on public.documents
--     for all
--     using (org_id = public.current_org_id())
--     with check (org_id = public.current_org_id());
