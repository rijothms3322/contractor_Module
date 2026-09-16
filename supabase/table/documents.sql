create table public.documents (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    file_path text not null,

    file_name text not null,

    mime_type text not null,

    file_size bigint,

    document_type text not null default 'other',

    ocr_text text,

    ocr_confidence numeric,

    status text not null default 'uploaded',

    needs_review boolean not null default false,

    error_message text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

alter table public.documents
add constraint documents_document_type_check
check (
    document_type in (
        'prescription',
        'lab_report',
        'medical_report',
        'discharge_summary',
        'radiology',
        'pathology',
        'other'
    )
);

alter table public.documents
add constraint documents_status_check
check (
    status in (
        'uploaded',
        'processing',
        'completed',
        'failed'
    )
);

create policy "Users can view own documents"
on public.documents
for select
to authenticated
using (
    user_id = (select auth.uid())
);

create policy "Users can create own documents"
on public.documents
for insert
to authenticated
with check (
    user_id = (select auth.uid())
);

create policy "Users can update own documents"
on public.documents
for update
to authenticated
using (
    user_id = (select auth.uid())
)
with check (
    user_id = (select auth.uid())
);

create policy "Users can delete own documents"
on public.documents
for delete
to authenticated
using (
    user_id = (select auth.uid())
);

create index idx_documents_user_id
on public.documents(user_id);

create index idx_documents_created_at
on public.documents(created_at desc);

create index idx_documents_status
on public.documents(status);

create index idx_documents_document_type
on public.documents(document_type);