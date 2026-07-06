-- ====================================================================
-- MEDIMZ DATABASE SCHEMA - PHASE 1 MVP
-- ====================================================================

-- Enable UUID generation extension if not loaded
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Linked to Supabase Auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    age INT,
    gender TEXT,
    medical_conditions TEXT[] DEFAULT '{}',
    addresses JSONB[] DEFAULT '{}',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. FAMILY MEMBERS
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    relationship TEXT NOT NULL, -- 'Dad', 'Mom', 'Spouse', 'Child', 'Other'
    age INT,
    gender TEXT,
    medical_conditions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users access own family members" ON public.family_members
    FOR ALL USING (auth.uid() = user_id);

-- 3. MEDICINES
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL, -- e.g., '10mg', '1 Tablet', '2 drops'
    instructions TEXT NOT NULL, -- e.g., 'After breakfast', 'Before sleep'
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
    timings TEXT[] DEFAULT '{}', -- subset of ['morning', 'afternoon', 'evening', 'night']
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users access own medicines" ON public.medicines
    FOR ALL USING (auth.uid() = user_id);

-- 4. REMINDERS (Dose scheduler and logger)
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    timing_slot TEXT NOT NULL CHECK (timing_slot IN ('morning', 'afternoon', 'evening', 'night')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed')),
    taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users access own reminders" ON public.reminders
    FOR ALL USING (auth.uid() = user_id);

-- Indexing for fast schedule lookups
CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON public.reminders(user_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);

-- 5. LABS
CREATE TABLE IF NOT EXISTS public.labs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.0,
    logo_url TEXT,
    cover_url TEXT,
    distance_kms NUMERIC(4, 2),
    fast_collection_mins INT DEFAULT 60,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read labs" ON public.labs
    FOR SELECT USING (true);

-- 6. DIAGNOSTIC TESTS
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parameters_count INT DEFAULT 1,
    original_price NUMERIC(10, 2) NOT NULL,
    discounted_price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read tests" ON public.tests
    FOR SELECT USING (true);

-- 7. BOOKINGS (Home sample collection test bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lab_id UUID NOT NULL REFERENCES public.labs(id) ON DELETE RESTRICT,
    test_ids UUID[] NOT NULL DEFAULT '{}',
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL, -- e.g., '07:00 AM - 08:00 AM'
    address JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'out_for_collection', 'collected', 'processing', 'completed', 'cancelled')),
    phlebotomist_name TEXT,
    phlebotomist_rating NUMERIC(3, 2),
    phlebotomist_phone TEXT,
    phlebotomist_avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users access own bookings" ON public.bookings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow admins view all bookings" ON public.bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 8. LAB REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- Path to file in Supabase Storage bucket
    ai_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users access own reports" ON public.reports
    FOR ALL USING (auth.uid() = user_id);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system' CHECK (type IN ('reminder', 'booking', 'system')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users access own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Seed Data Helper Triggers
-- Automatically create profile on Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on auth.users (Requires execution as superuser in SQL editor)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
