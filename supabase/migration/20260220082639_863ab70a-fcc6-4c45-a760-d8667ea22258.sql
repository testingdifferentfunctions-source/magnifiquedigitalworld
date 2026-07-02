
-- Drop the overly permissive INSERT policy on article_views
DROP POLICY IF EXISTS "Anyone can insert views" ON public.article_views;
