-- 20260824123000_mode_categories_and_subcategories.sql
-- Ensures categories table has mode support and provisions subcategories table for dynamic mode-based category navigation

-- 1. Add mode and metadata columns to categories if not present
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'articles',
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2. Create subcategories table for structured hierarchical navigation
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'articles',
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS on subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subcategories' AND policyname = 'Anyone can read subcategories'
  ) THEN
    CREATE POLICY "Anyone can read subcategories"
      ON public.subcategories FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subcategories' AND policyname = 'Admins can manage subcategories'
  ) THEN
    CREATE POLICY "Admins can manage subcategories"
      ON public.subcategories FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

GRANT SELECT ON public.subcategories TO anon, authenticated;
GRANT ALL ON public.subcategories TO service_role;

-- 4. Create index on categories (mode) and subcategories (category_id, mode)
CREATE INDEX IF NOT EXISTS categories_mode_idx ON public.categories (mode);
CREATE INDEX IF NOT EXISTS subcategories_category_id_mode_idx ON public.subcategories (category_id, mode);
