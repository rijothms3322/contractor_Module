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

    report_date date,

    note text,

    report_category text,
    
    is_private boolean not null default false,

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
add constraint documents_report_category_check
check (
    report_category is null
    or report_category in (
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
