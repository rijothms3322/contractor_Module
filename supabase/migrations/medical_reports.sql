create table if not exists public.medical_reports (

    id uuid primary key default gen_random_uuid(),
    document_id uuid not null
    references public.documents(id)
    on delete cascade,
    user_id uuid not null
    references public.profiles(id)
    on delete cascade,
    doctor_name text,
    hospital_name text,
    diagnosis text,
    report_data jsonb,
    created_at timestamptz
    default now()
);


alter table public.medical_reports
enable row level security;
create policy "Users view own reports"
on public.medical_reports
for select
using (
auth.uid() = user_id
);
create policy "Users insert own reports"
on public.medical_reports
for insert
with check (
auth.uid() = user_id
);