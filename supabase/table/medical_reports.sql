-- ============================================================
-- DROP EXISTING TABLE
-- ============================================================

DROP TABLE IF EXISTS public.medical_reports CASCADE;


-- ============================================================
-- CREATE MEDICAL REPORTS TABLE
-- ============================================================

CREATE TABLE public.medical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_id UUID 
        REFERENCES public.documents(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        references public.profiles(id)
        ON DELETE CASCADE,

    patient_id UUID,

    report_category TEXT NOT NULL,

    report_title TEXT,

    doctor_name TEXT,

    hospital_name TEXT,

    diagnosis TEXT,

    notes TEXT,

    -- Original AI/OCR extraction.
    -- Never modify this after extraction.
    ai_result JSONB,

    -- Final user-confirmed/user-corrected data.
    final_result JSONB,

    ai_confidence NUMERIC
        CHECK (
            ai_confidence IS NULL
            OR (
                ai_confidence >= 0
                AND ai_confidence <= 100
            )
        ),

    needs_review BOOLEAN NOT NULL DEFAULT false,

    manually_updated BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One medical report per document
    CONSTRAINT medical_reports_document_unique
        UNIQUE (document_id),

    -- Allowed report categories
    CONSTRAINT medical_reports_category_check
        CHECK (
            report_category IN (
                'lab_report',
                'medical_report',
                'discharge_summary',
                'radiology',
                'pathology',
                'other'
            )
        )
);


-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.medical_reports
ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_medical_reports_user_id
ON public.medical_reports(user_id);

CREATE INDEX idx_medical_reports_patient_id
ON public.medical_reports(patient_id);

CREATE INDEX idx_medical_reports_created_at
ON public.medical_reports(created_at DESC);


-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

CREATE POLICY "Users can view own medical reports"
ON public.medical_reports
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);


CREATE POLICY "Users can create own medical reports"
ON public.medical_reports
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
);


CREATE POLICY "Users can update own medical reports"
ON public.medical_reports
FOR UPDATE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
)
WITH CHECK (
    user_id = (SELECT auth.uid())
);


CREATE POLICY "Users can delete own medical reports"
ON public.medical_reports
FOR DELETE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);


-- ============================================================
-- OPTIONAL: UPDATED_AT AUTO-UPDATE FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_medical_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE TRIGGER medical_reports_updated_at
BEFORE UPDATE ON public.medical_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_medical_reports_updated_at();