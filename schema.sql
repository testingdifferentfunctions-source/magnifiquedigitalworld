-- =============================================================================
-- Supabase Schema Update: Subcategories Bilingual & Slug Fields
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- =============================================================================

-- 1. Ensure table exists with all standard columns
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'articles',
  mode_slug TEXT DEFAULT 'articles',
  name TEXT,
  title TEXT,
  name_en TEXT,
  title_en TEXT,
  slug TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add columns if table already exists
ALTER TABLE public.subcategories
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'articles',
  ADD COLUMN IF NOT EXISTS mode_slug TEXT DEFAULT 'articles',
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Synchronize synonym columns for backward/forward compatibility
UPDATE public.subcategories
SET title = COALESCE(title, name),
    name = COALESCE(name, title),
    title_en = COALESCE(title_en, name_en),
    name_en = COALESCE(name_en, title_en),
    mode = COALESCE(mode, mode_slug, 'articles'),
    mode_slug = COALESCE(mode_slug, mode, 'articles');

-- 4. Enable Row Level Security and setup access policies
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
GRANT ALL ON public.subcategories TO authenticated;
GRANT ALL ON public.subcategories TO service_role;

-- 5. Helpful indexing
CREATE INDEX IF NOT EXISTS subcategories_category_id_idx ON public.subcategories (category_id);
CREATE INDEX IF NOT EXISTS subcategories_mode_idx ON public.subcategories (mode);
CREATE INDEX IF NOT EXISTS subcategories_slug_idx ON public.subcategories (slug);

-- =============================================================================
-- Supabase Storage: article-images Bucket & RLS Policies
-- =============================================================================

-- 6. Create or update the 'article-images' public bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];

-- 7. Storage RLS Policies for 'article-images'
DROP POLICY IF EXISTS "Public Read Access for article-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload article-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update article-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete article-images" ON storage.objects;

-- Public can view/read images
CREATE POLICY "Public Read Access for article-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'article-images');

-- Authenticated users (or admins) can upload new images
CREATE POLICY "Authenticated users can upload article-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images');

-- Authenticated users (or admins) can update existing images
CREATE POLICY "Authenticated users can update article-images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-images')
  WITH CHECK (bucket_id = 'article-images');

-- Authenticated users (or admins) can delete images
CREATE POLICY "Authenticated users can delete article-images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-images');

