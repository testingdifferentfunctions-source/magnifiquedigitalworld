-- =============================================================================
-- Migration: Create and configure subcategories table & reload PostgREST schema cache
-- =============================================================================

-- 1. Створюємо таблицю підрозділів, ТІЛЬКИ якщо її ще немає
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT,
    title TEXT,
    name_en TEXT,
    title_en TEXT,
    slug TEXT,
    mode TEXT,
    mode_slug TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Вмикаємо Row Level Security (RLS)
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- 3. Надаємо базові права доступу для API
GRANT ALL ON TABLE public.subcategories TO anon, authenticated, service_role;

-- 4. Безпечно створюємо політики (видаляємо старі, якщо вони вже існують, щоб уникнути помилок)
DROP POLICY IF EXISTS "Allow public read access subcategories" ON public.subcategories;
CREATE POLICY "Allow public read access subcategories" ON public.subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all access subcategories" ON public.subcategories;
CREATE POLICY "Allow all access subcategories" ON public.subcategories FOR ALL USING (true) WITH CHECK (true);

-- 5. Примусово оновлюємо кеш API
NOTIFY pgrst, 'reload schema';
