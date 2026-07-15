-- Create family links join table
CREATE TABLE IF NOT EXISTS public.family_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_family_pair UNIQUE(user_id_1, user_id_2)
);

-- Enable Row Level Security
ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Allow users view own connections" ON public.family_links
    FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Allow users create connections" ON public.family_links
    FOR INSERT WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Allow users update own connections" ON public.family_links
    FOR UPDATE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Allow users delete own connections" ON public.family_links
    FOR DELETE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
