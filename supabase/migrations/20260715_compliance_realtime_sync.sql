-- ====================================================================
-- MEDIMZ DATABASE SCHEMA - COMPLIANCE AUDIT LOGS & RLS SHARING UPDATE
-- ====================================================================

-- 1. Create compliance audit logs table
CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    marked_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    reminder_id TEXT NOT NULL,
    status TEXT NOT NULL,
    source_device TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for compliance audit logs
DROP POLICY IF EXISTS "Allow users to insert own audit logs" ON public.compliance_audit_logs;
CREATE POLICY "Allow users to insert own audit logs" ON public.compliance_audit_logs
    FOR INSERT WITH CHECK (auth.uid() = marked_by_id);

DROP POLICY IF EXISTS "Allow users to view own family audit logs" ON public.compliance_audit_logs;
CREATE POLICY "Allow users to view own family audit logs" ON public.compliance_audit_logs
    FOR SELECT USING (
        auth.uid() = medicine_owner_id 
        OR auth.uid() = marked_by_id
    );

-- 2. Adjust RLS UPDATE policies for public.reminders to allow updates by family members
DROP POLICY IF EXISTS "Allow users update own or family reminders" ON public.reminders;
CREATE POLICY "Allow users update own or family reminders" ON public.reminders
    FOR UPDATE USING (
        -- Owner can update
        auth.uid() = user_id
        OR
        -- Family members can update if they share family_id and corresponding medicine is NOT private
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

-- 3. Adjust RLS UPDATE policies for public.medicines to allow stock updates by family members
DROP POLICY IF EXISTS "Allow users update own or family medicines" ON public.medicines;
CREATE POLICY "Allow users update own or family medicines" ON public.medicines
    FOR UPDATE USING (
        -- Owner can update
        auth.uid() = user_id
        OR
        -- Family members can update stock counts of public medicines in same family group
        EXISTS (
            SELECT 1 FROM public.profiles p1
            JOIN public.profiles p2 ON p1.family_id = p2.family_id
            WHERE p1.id = auth.uid() 
              AND p2.id = medicines.user_id 
              AND p1.family_id IS NOT NULL
              AND NOT medicines.is_private
        )
    );
