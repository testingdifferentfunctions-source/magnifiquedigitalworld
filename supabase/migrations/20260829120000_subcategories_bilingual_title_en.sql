-- 20260829120000_subcategories_bilingual_title_en.sql
-- Add title_en column to subcategories table for bilingual translation support

ALTER TABLE public.subcategories
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Sync title_en with name_en if name_en has values
UPDATE public.subcategories
SET title_en = COALESCE(title_en, name_en),
    name_en = COALESCE(name_en, title_en);
