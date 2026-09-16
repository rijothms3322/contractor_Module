create table if not exists public.prescription_medicines (
id uuid primary key default gen_random_uuid(),
user_id uuid not null
references public.profiles(id)
on delete cascade,
document_id uuid not null
references public.documents(id)
on delete cascade,
medicine_master_id uuid
references public.medicine_master(id)
on delete set null,
medicine_name text not null,
dosage text,
frequency text,
duration text,
instructions text,
confidence numeric,
needs_review boolean default false,
created_at timestamptz default now()
);

alter table public.prescription_medicines
enable row level security;

create policy "Users view own prescription medicines"
on public.prescription_medicines
for select
using(
 auth.uid() = user_id
);

create policy "Users insert own prescription medicines"
on public.prescription_medicines
for insert
with check(
 auth.uid() = user_id
);

create policy "Users update own prescription medicines"
on public.prescription_medicines
for update
using(
 auth.uid() = user_id
);

create policy "Users delete own prescription medicines"
on public.prescription_medicines
for delete
using(
 auth.uid() = user_id
);