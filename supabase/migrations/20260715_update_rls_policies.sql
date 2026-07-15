-- Drop old restrict-only RLS policies
DROP POLICY IF EXISTS "Allow users access own medicines" ON public.medicines;
DROP POLICY IF EXISTS "Allow users access own reminders" ON public.reminders;

-- Re-create RLS for medicines (full access own, select shared)
CREATE POLICY "Allow users access own medicines" ON public.medicines
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow users view family medicines" ON public.medicines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_links 
            WHERE status = 'accepted' 
              AND (
                (user_id_1 = auth.uid() AND user_id_2 = medicines.user_id)
                OR (user_id_2 = auth.uid() AND user_id_1 = medicines.user_id)
              )
        )
    );

-- Re-create RLS for reminders (full access own, select shared)
CREATE POLICY "Allow users access own reminders" ON public.reminders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow users view family reminders" ON public.reminders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_links 
            WHERE status = 'accepted' 
              AND (
                (user_id_1 = auth.uid() AND user_id_2 = reminders.user_id)
                OR (user_id_2 = auth.uid() AND user_id_1 = reminders.user_id)
              )
        )
    );
