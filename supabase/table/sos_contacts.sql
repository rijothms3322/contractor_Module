CREATE TABLE IF NOT EXISTS public.sos_contacts (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Supabase authenticated user
    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    -- SOS contact full name
    full_name TEXT NOT NULL,

    -- SOS contact phone number
    phone_number TEXT NOT NULL,

    -- Optional email address
    email TEXT,

    -- Relationship with the user
    relation TEXT NOT NULL
        CHECK (
            relation IN (
                'sibling',
                'child',
                'spouse',
                'parent',
                'doctor',
                'neighbour',
                'friend',
                'other'
            )
        ),

    -- Contact source
    -- family_sync = selected from Family Sync
    -- manual = manually added
    source TEXT NOT NULL DEFAULT 'manual'
        CHECK (source IN ('family_sync', 'manual')),

    -- Optional Family Sync member reference
    family_member_id UUID,

    -- Whether the contact is active
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS sos_contacts_user_id_idx
ON public.sos_contacts(user_id);

CREATE INDEX IF NOT EXISTS sos_contacts_user_active_idx
ON public.sos_contacts(user_id, is_active);


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.sos_contacts ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- SELECT POLICY
-- Users can view only their own SOS contacts
-- =====================================================

CREATE POLICY "Users can view own SOS contacts"
ON public.sos_contacts
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
);


-- =====================================================
-- INSERT POLICY
-- Users can insert only their own SOS contacts
-- =====================================================

CREATE POLICY "Users can insert own SOS contacts"
ON public.sos_contacts
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
);


-- =====================================================
-- UPDATE POLICY
-- Users can update only their own SOS contacts
-- =====================================================

CREATE POLICY "Users can update own SOS contacts"
ON public.sos_contacts
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id
)
WITH CHECK (
    auth.uid() = user_id
);


-- =====================================================
-- DELETE POLICY
-- Users can delete only their own SOS contacts
-- =====================================================

CREATE POLICY "Users can delete own SOS contacts"
ON public.sos_contacts
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id
);
