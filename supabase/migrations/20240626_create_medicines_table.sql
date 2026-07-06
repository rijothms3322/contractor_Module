create extension if not exists "pgcrypto";

create table if not exists medicines (
  id uuid primary key default gen_random_uuid(),
  generic_name text not null,
  brand_name text not null,
  strength text,
  dosage_form text,
  manufacturer text,
  composition text,
  search_keywords text,
  schedule_type text,
  prescription_required boolean default true,
  country text,
  language text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- full‑text search vector covering searchable columns
alter table medicines add column fts tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(brand_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(generic_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(composition, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(search_keywords, '')), 'D')
  ) stored;

-- indexes for fast lookup
create index idx_medicines_fts on medicines using gin (fts);
create index idx_medicines_brand on medicines (lower(brand_name));
create index idx_medicines_generic on medicines (lower(generic_name));
create index idx_medicines_active on medicines (is_active);
