-- ============================================================================
-- PROFILES - ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove old policies (safe to run multiple times)
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- ----------------------------------------------------------------------------
-- SELECT
-- Users can only read their own profile.
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (
    auth.uid() = id
);

-- ----------------------------------------------------------------------------
-- UPDATE
-- Users can only update their own profile.
-- WITH CHECK ensures they cannot change ownership.
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (
    auth.uid() = id
)
WITH CHECK (
    auth.uid() = id
);

-- ----------------------------------------------------------------------------
-- INSERT
-- No INSERT policy.
-- Profiles are created automatically by the
-- handle_new_user() trigger during signup.
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- DELETE
-- No DELETE policy.
-- Users cannot delete profiles directly.
-- ----------------------------------------------------------------------------