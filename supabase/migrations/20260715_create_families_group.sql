-- ====================================================================
-- MEDIMZ DATABASE SCHEMA - PHASE 2: CENTRALIZED GROUP FAMILY SYSTEM
-- ====================================================================

-- 1. Create families table
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code TEXT UNIQUE NOT NULL, -- format FAM-XXXXXX (6 uppercase alphanumeric)
    name TEXT NOT NULL,
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add family_id to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id) ON DELETE SET NULL;

-- 3. Enable RLS on families (NO PUBLIC SELECT)
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Admins and members can read/write their own family details
DROP POLICY IF EXISTS "Allow members access own family details" ON public.families;
CREATE POLICY "Allow members access own family details" ON public.families
    FOR ALL USING (
        auth.uid() = admin_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND family_id = families.id
        )
    );

-- 4. Create secure RPC function for code verification
-- This is a SECURITY DEFINER function to bypass select restrictions but only return name, member count, and admin name.
CREATE OR REPLACE FUNCTION public.verify_family_code(input_code TEXT)
RETURNS TABLE (
    family_id UUID,
    family_name TEXT,
    member_count INT,
    admin_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id AS family_id,
        f.name AS family_name,
        COUNT(p.id)::INT AS member_count,
        COALESCE((SELECT full_name FROM public.profiles WHERE id = f.admin_id), 'Unknown') AS admin_name
    FROM public.families f
    LEFT JOIN public.profiles p ON p.family_id = f.id
    WHERE f.family_code = input_code
    GROUP BY f.id, f.name, f.admin_id;
END;
$$;

-- 5. Re-create RLS for medicines (full access own, select shared only if same family_id and NOT private)
DROP POLICY IF EXISTS "Allow users view family medicines" ON public.medicines;
CREATE POLICY "Allow users view family medicines" ON public.medicines
    FOR SELECT USING (
        NOT is_private 
        AND EXISTS (
            SELECT 1 FROM public.profiles p1
            JOIN public.profiles p2 ON p1.family_id = p2.family_id
            WHERE p1.id = auth.uid() AND p2.id = medicines.user_id AND p1.family_id IS NOT NULL
        )
    );

-- 6. Re-create RLS for reminders (full access own, select shared only if same family_id and corresponding medicine is NOT private)
DROP POLICY IF EXISTS "Allow users view family reminders" ON public.reminders;
CREATE POLICY "Allow users view family reminders" ON public.reminders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p1
            JOIN public.profiles p2 ON p1.family_id = p2.family_id
            JOIN public.medicines m ON m.id = reminders.medicine_id
            WHERE p1.id = auth.uid() 
              AND p2.id = reminders.user_id 
              AND p1.family_id IS NOT NULL
              AND NOT m.is_private
        )
    );
