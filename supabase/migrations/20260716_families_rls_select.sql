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

-- 3. Allow users to update their own profile details (needed for joining/leaving families)
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


    DROP POLICY IF EXISTS "Allow users access own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Allow users update own or family reminders" ON public.reminders;
DROP POLICY IF EXISTS "Allow users view family reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Family members can insert reminders" ON public.reminders;
DROP POLICY IF EXISTS "Family members can insert reminders for each other" ON public.reminders;

CREATE POLICY "Family members can insert reminders"
ON public.reminders
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles AS p1
    INNER JOIN public.profiles AS p2
      ON p1.family_id = p2.family_id
    WHERE p1.id = auth.uid()
      AND p2.id = reminders.user_id
      AND p1.family_id IS NOT NULL
      AND p2.family_id IS NOT NULL
  )
);


DROP POLICY IF EXISTS "Family members can insert reminders" ON reminders;

CREATE POLICY "Family members can insert reminders"
ON reminders
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles me
    JOIN profiles target
      ON target.family_id = me.family_id
    WHERE me.id = auth.uid()
      AND target.id = reminders.user_id
      AND me.family_id IS NOT NULL
  )
);
DROP POLICY IF EXISTS "Family members can update reminders" ON reminders;

CREATE POLICY "Family members can update reminders"
ON reminders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles me
    JOIN profiles target
      ON target.family_id = me.family_id
    WHERE me.id = auth.uid()
      AND target.id = reminders.user_id
      AND me.family_id IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles me
    JOIN profiles target
      ON target.family_id = me.family_id
    WHERE me.id = auth.uid()
      AND target.id = reminders.user_id
      AND me.family_id IS NOT NULL
  )
);
DROP POLICY IF EXISTS "Family members can view reminders" ON reminders;

CREATE POLICY "Family members can view reminders"
ON reminders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles me
    JOIN profiles target
      ON target.family_id = me.family_id
    WHERE me.id = auth.uid()
      AND target.id = reminders.user_id
      AND me.family_id IS NOT NULL
  )
);
DROP POLICY IF EXISTS "Reminder owners can delete reminders" ON reminders;

CREATE POLICY "Reminder owners can delete reminders"
ON reminders
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);

