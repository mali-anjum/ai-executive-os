-- =============================================================================
-- Test: Org A cannot access Org B data
-- =============================================================================
-- Run inside a single transaction in the Supabase SQL editor (or `psql -1`)
-- AFTER applying `0001_multi_tenancy.sql`. We simulate two real authenticated
-- users via `request.jwt.claims` so every statement is evaluated under that
-- user's tenant context — exactly like production requests.
-- =============================================================================

begin;

-- --- Fixture: two organizations + two members (one owner each) --------------
insert into public.organizations (id, name, slug) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Org A', 'org-a'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Org B', 'org-b')
on conflict (id) do nothing;

insert into public.organization_members (org_id, user_id, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000a1', 'owner'),
  ('bbbbbbbb-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-0000000000b2', 'owner')
on conflict (org_id, user_id) do nothing;

-- --- Test 1: Org A sees its own org and NOT Org B ----------------------------
select set_config('request.jwt.claims',
  '{"sub": "00000000-0000-0000-0000-0000000000a1"}', true);

select '1a: org A can select its own organization' as check_name;
select count(*) = 1 as passed
from public.organizations
where id = 'aaaaaaaa-0000-0000-0000-000000000001';  -- expect true

select '1b: org A CANNOT select Org B organization' as check_name;
select count(*) = 0 as passed
from public.organizations
where id = 'bbbbbbbb-0000-0000-0000-000000000002';  -- expect true (blocked by RLS)

select '1c: org A sees only its own membership row' as check_name;
select count(*) = 1 as passed
from public.organization_members;                    -- expect true (1 row: Org A)

-- --- Test 2: Org B sees its own org and NOT Org A ----------------------------
select set_config('request.jwt.claims',
  '{"sub": "00000000-0000-0000-0000-0000000000b2"}', true);

select '2a: org B can select its own organization' as check_name;
select count(*) = 1 as passed
from public.organizations
where id = 'bbbbbbbb-0000-0000-0000-000000000002';  -- expect true

select '2b: org B CANNOT select Org A organization' as check_name;
select count(*) = 0 as passed
from public.organizations
where id = 'aaaaaaaa-0000-0000-0000-000000000001';  -- expect true (blocked by RLS)

-- --- Test 3: Signup trigger assigns the initial owner role --------------------
-- Simulate the signup path: insert an auth.users row with signup metadata and
-- confirm the trigger materialized org + owner membership.
insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
values (
  '00000000-0000-0000-0000-0000000000c3',
  'owner@orgc.test',
  jsonb_build_object(
    'org_id', 'cccccccc-0000-0000-0000-000000000003',
    'org_name', 'Org C',
    'org_slug', 'org-c',
    'role', 'owner'
  ),
  now(), now()
);

select set_config('request.jwt.claims',
  '{"sub": "00000000-0000-0000-0000-0000000000c3"}', true);

select '3a: organization materialized from signup metadata' as check_name;
select count(*) = 1 as passed
from public.organizations
where slug = 'org-c';                               -- expect true

select '3b: owner membership materialized' as check_name;
select count(*) = 1 as passed
from public.organization_members
where user_id = '00000000-0000-0000-0000-0000000000c3'
  and role = 'owner';                               -- expect true

-- --- Test 4: Org C member cannot read Org A data ------------------------------
select '4a: org C sees no Org A rows' as check_name;
select count(*) = 0 as passed
from public.organizations
where id = 'aaaaaaaa-0000-0000-0000-000000000001';  -- expect true (blocked by RLS)

-- Reset the claim and clean up.
select set_config('request.jwt.claims', '{}', true);
rollback;
