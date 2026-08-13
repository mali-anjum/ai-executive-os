-- =============================================================================
-- Drop Alembic versioning table
-- =============================================================================
-- Alembic is decommissioned (see the backend repo: "never use Alembic").
-- Schema changes are tracked only by native Supabase migrations.
--
-- The `alembic_version` table was created by Alembic in this Supabase project
-- and only holds the applied Alembic revision (a single `version_num` column).
-- This migration removes that tracking table + its data entirely.
--
-- It is safe to run even if the table is already gone (`drop table if exists`).
-- =============================================================================

drop table if exists public.alembic_version;
