CREATE OR REPLACE FUNCTION public.search_medicines(search_text TEXT)
RETURNS TABLE (
    id UUID,
    medicine_name TEXT,
    dosage_form TEXT,
    strength TEXT
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        mm.id,
        mm.medicine_name,
        mm.dosage_form,
        mm.strength
    FROM public.medicine_master AS mm
    WHERE mm.is_active = true
      AND mm.medicine_name ILIKE '%' || TRIM(search_text) || '%'
    ORDER BY
        CASE
            WHEN mm.medicine_name ILIKE TRIM(search_text) || '%' THEN 1
            ELSE 2
        END,
        mm.medicine_name
    LIMIT 5;
$$;

GRANT EXECUTE
ON FUNCTION public.search_medicines(TEXT)
TO authenticated;