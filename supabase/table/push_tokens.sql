CREATE TABLE IF NOT EXISTS public.push_tokens (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Supabase authenticated user
    user_id UUID NOT NULL
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    -- FCM registration token
    token TEXT NOT NULL,

    -- Device/platform where the token was generated
    platform TEXT NOT NULL
        CHECK (platform IN ('android', 'ios', 'web')),

    -- Optional unique device identifier
    device_id TEXT,

    -- Whether this token is currently usable
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Token timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate token for same user
    CONSTRAINT push_tokens_user_token_unique
        UNIQUE (user_id, token)
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push tokens"
ON public.push_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
ON public.push_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens"
ON public.push_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
ON public.push_tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);