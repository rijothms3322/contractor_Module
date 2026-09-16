
-- ============================================================
-- STEP 1: Extensions
-- ============================================================
create extension if not exists "pgcrypto";
 
-- ============================================================
-- STEP 2: Create medicine_master table
-- Note: generic_name is nullable since the source CSV only has
-- brand/medicine name, dosage_form, and strength. Backfill
-- generic_name later if/when you get that data.
-- ============================================================
create table if not exists public.medicine_master (
    id uuid primary key default gen_random_uuid(),
    generic_name text,
    medicine_name text not null,
    strength text,
    dosage_form text,
    manufacturer text,
    composition text,
    search_keywords text,
    country text default 'India',
    language text default 'en',
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
 
-- ============================================================
-- STEP 3: Search vector (full text search)
-- ============================================================
ALTER TABLE public.medicine_master
ADD COLUMN fts tsvector
GENERATED ALWAYS AS (
    setweight(
        to_tsvector('english', coalesce(medicine_name,'')),
        'A'
    )
    ||
    setweight(
        to_tsvector('english', coalesce(generic_name,'')),
        'B'
    )
    ||
    setweight(
        to_tsvector('english', coalesce(composition,'')),
        'C'
    )
) STORED;
 
create index if not exists medicine_master_fts_idx
on public.medicine_master
using gin(fts);
 
create index if not exists medicine_master_brand_idx
on public.medicine_master(lower(medicine_name));
 
create index if not exists medicine_master_generic_idx
on public.medicine_master(lower(generic_name));
 