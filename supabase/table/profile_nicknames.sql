CREATE TABLE IF NOT EXISTS public.profile_nicknames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User who created the nickname
    owner_user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    -- Family member who receives this nickname
    target_user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    nickname TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One personal nickname per family member
    UNIQUE (owner_user_id, target_user_id),

    -- Cannot nickname yourself
    CHECK (owner_user_id <> target_user_id),

    -- Cannot save empty nickname
    CHECK (length(trim(nickname)) > 0)
);
ALTER TABLE public.profile_nicknames ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own family nicknames"
ON public.profile_nicknames;

CREATE POLICY "Users can view own family nicknames"
ON public.profile_nicknames
FOR SELECT
TO authenticated
USING (
    owner_user_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.profiles owner_profile
        JOIN public.profiles target_profile
            ON target_profile.family_id = owner_profile.family_id
        WHERE owner_profile.id = auth.uid()
          AND target_profile.id = profile_nicknames.target_user_id
          AND owner_profile.family_id IS NOT NULL
    )
);

DROP POLICY IF EXISTS "Users can create nicknames for family members"
ON public.profile_nicknames;

CREATE POLICY "Users can create nicknames for family members"
ON public.profile_nicknames
FOR INSERT
TO authenticated
WITH CHECK (
    owner_user_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.profiles owner_profile
        JOIN public.profiles target_profile
            ON target_profile.family_id = owner_profile.family_id
        WHERE owner_profile.id = auth.uid()
          AND target_profile.id = profile_nicknames.target_user_id
          AND owner_profile.family_id IS NOT NULL
    )
);

DROP POLICY IF EXISTS "Users can update family nicknames"
ON public.profile_nicknames;

CREATE POLICY "Users can update family nicknames"
ON public.profile_nicknames
FOR UPDATE
TO authenticated
USING (
    owner_user_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.profiles owner_profile
        JOIN public.profiles target_profile
            ON target_profile.family_id = owner_profile.family_id
        WHERE owner_profile.id = auth.uid()
          AND target_profile.id = profile_nicknames.target_user_id
          AND owner_profile.family_id IS NOT NULL
    )
)
WITH CHECK (
    owner_user_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM public.profiles owner_profile
        JOIN public.profiles target_profile
            ON target_profile.family_id = owner_profile.family_id
        WHERE owner_profile.id = auth.uid()
          AND target_profile.id = profile_nicknames.target_user_id
          AND owner_profile.family_id IS NOT NULL
    )
);


