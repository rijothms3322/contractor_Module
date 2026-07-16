-- ====================================================================
-- MEDIMZ DATABASE SCHEMA - FAMILIES & PROFILES RLS SELECT FOR MEMBERS
-- ====================================================================

-- 1. Allow SELECT on families for all authenticated users (to verify invitation codes)
DROP POLICY IF EXISTS "Allow authenticated select on families" ON public.families;
CREATE POLICY "Allow authenticated select on families" ON public.families
    FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Allow SELECT on profiles for all authenticated users (to view admin names and shared family rosters)
DROP POLICY IF EXISTS "Allow authenticated select on profiles" ON public.profiles;
CREATE POLICY "Allow authenticated select on profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');
