-- Migration: Add image_url_uk and image_url_en to mode_entries for localized preview images
ALTER TABLE IF EXISTS public.mode_entries
ADD COLUMN IF NOT EXISTS image_url_uk TEXT,
ADD COLUMN IF NOT EXISTS image_url_en TEXT;

-- Backfill image_url_uk with existing image_url if not already set
UPDATE public.mode_entries
SET image_url_uk = image_url
WHERE image_url_uk IS NULL AND image_url IS NOT NULL;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
