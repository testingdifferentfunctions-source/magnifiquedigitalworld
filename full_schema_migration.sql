-- =============================================================================
-- FULL CLEAN SUPABASE DATABASE SCHEMA INITIALIZATION
-- =============================================================================

-- 1. EXTENSIONS & ROLES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- 2. TABLES

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  slug TEXT,
  mode TEXT DEFAULT 'articles',
  mode_slug TEXT DEFAULT 'articles',
  image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop',
  sub_topics TEXT[] NOT NULL DEFAULT '{}'::text[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subcategories
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT,
  title TEXT,
  name_en TEXT,
  title_en TEXT,
  slug TEXT,
  mode TEXT NOT NULL DEFAULT 'articles',
  mode_slug TEXT DEFAULT 'articles',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Articles
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_uk TEXT,
  title_en TEXT,
  description TEXT NOT NULL,
  description_uk TEXT,
  description_en TEXT,
  content TEXT NOT NULL DEFAULT '',
  content_uk TEXT,
  content_en TEXT,
  image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
  original_source_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  reads INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  show_test_button BOOLEAN DEFAULT true,
  embedding vector(384),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mode Entries
CREATE TABLE IF NOT EXISTS public.mode_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  slug TEXT,
  title_uk TEXT NOT NULL,
  title_en TEXT,
  description_uk TEXT NOT NULL DEFAULT '',
  description_en TEXT,
  blocks_uk JSONB DEFAULT '[]'::jsonb,
  blocks_en JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  image_url TEXT,
  image_source_url TEXT,
  external_url TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  canonical_url_uk TEXT,
  canonical_url_en TEXT,
  embedding vector(384),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Translations
CREATE TABLE IF NOT EXISTS public.category_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, language)
);

CREATE TABLE IF NOT EXISTS public.article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (article_id, language)
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Analytics & Tracking
CREATE TABLE IF NOT EXISTS public.article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (article_id, viewer_id)
);

CREATE TABLE IF NOT EXISTS public.user_article_likes (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (article_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'articles',
  target_id TEXT NOT NULL,
  viewer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social Links
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. HELPER FUNCTIONS & RPCs
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.log_analytics_event(
  p_event_type TEXT,
  p_mode TEXT,
  p_target_id TEXT,
  p_viewer_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.analytics_events (event_type, mode, target_id, viewer_id, metadata, created_at)
  VALUES (p_event_type, p_mode, p_target_id, p_viewer_id, p_metadata, now())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_24h_analytics()
RETURNS TABLE (views_24h BIGINT, likes_24h BIGINT, shares_24h BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'view' AND created_at >= (NOW() - INTERVAL '24 HOURS'))::BIGINT AS views_24h,
    COUNT(*) FILTER (WHERE event_type = 'like' AND created_at >= (NOW() - INTERVAL '24 HOURS'))::BIGINT AS likes_24h,
    COUNT(*) FILTER (WHERE event_type = 'share' AND created_at >= (NOW() - INTERVAL '24 HOURS'))::BIGINT AS shares_24h
  FROM public.analytics_events;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_article_view(p_article_id UUID, p_viewer_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.articles SET reads = reads + 1 WHERE id = p_article_id AND published = true;
  INSERT INTO public.article_views (article_id, viewer_id)
  VALUES (p_article_id, p_viewer_id)
  ON CONFLICT (article_id, viewer_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_article_impressions(p_article_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.articles SET impressions = impressions + 1 WHERE id = ANY(p_article_ids) AND published = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_article_like_anonymous(p_article_id UUID, p_is_liking BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_is_liking THEN
    UPDATE public.articles SET likes = likes + 1 WHERE id = p_article_id;
  ELSE
    UPDATE public.articles SET likes = GREATEST(likes - 1, 0) WHERE id = p_article_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_mode_entry_like(p_entry_id UUID, p_is_liking BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_is_liking THEN
    UPDATE public.mode_entries SET likes = likes + 1 WHERE id = p_entry_id;
  ELSE
    UPDATE public.mode_entries SET likes = GREATEST(likes - 1, 0) WHERE id = p_entry_id;
  END IF;
END;
$$;

-- 4. VECTOR SIMILARITY SEARCH FUNCTIONS
CREATE OR REPLACE FUNCTION public.match_articles(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.1,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  title_uk TEXT,
  title_en TEXT,
  description TEXT,
  description_uk TEXT,
  description_en TEXT,
  content TEXT,
  image_url TEXT,
  category_id UUID,
  tags TEXT[],
  reads INTEGER,
  likes INTEGER,
  published BOOLEAN,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id, a.title, a.title_uk, a.title_en,
    a.description, a.description_uk, a.description_en,
    a.content, a.image_url, a.category_id, a.tags,
    a.reads, a.likes, a.published,
    (1 - (a.embedding <=> query_embedding))::float AS similarity
  FROM public.articles a
  WHERE a.published = true
    AND a.embedding IS NOT NULL
    AND (1 - (a.embedding <=> query_embedding)) > match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_mode_entries(
  query_embedding vector(384),
  entry_type text DEFAULT NULL,
  match_threshold float DEFAULT 0.05,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  slug TEXT,
  title_uk TEXT,
  title_en TEXT,
  description_uk TEXT,
  description_en TEXT,
  blocks_uk JSONB,
  blocks_en JSONB,
  tags TEXT[],
  image_url TEXT,
  external_url TEXT,
  likes INTEGER,
  published BOOLEAN,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id, m.type, m.slug, m.title_uk, m.title_en,
    m.description_uk, m.description_en,
    m.blocks_uk, m.blocks_en, m.tags,
    m.image_url, m.external_url, m.likes, m.published,
    (1 - (m.embedding <=> query_embedding))::float AS similarity
  FROM public.mode_entries m
  WHERE m.published = true
    AND m.embedding IS NOT NULL
    AND (entry_type IS NULL OR m.type = entry_type)
    AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mode_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Read policies for public access
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Public can view published articles" ON public.articles FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view published mode entries" ON public.mode_entries FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view translations" ON public.article_translations FOR SELECT USING (true);
CREATE POLICY "Public can view category translations" ON public.category_translations FOR SELECT USING (true);
CREATE POLICY "Public can view social links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Public can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can log analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view analytics" ON public.analytics_events FOR SELECT USING (true);
CREATE POLICY "Public can insert article views" ON public.article_views FOR INSERT WITH CHECK (true);

-- Admin mutation policies
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage subcategories" ON public.subcategories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage mode entries" ON public.mode_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage translations" ON public.article_translations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage user roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage social links" ON public.social_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. GRANT PERMISSIONS
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 7. STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read storage images" ON storage.objects FOR SELECT USING (bucket_id = 'article-images');
CREATE POLICY "Admins upload storage images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update storage images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete storage images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'article-images' AND public.has_role(auth.uid(), 'admin'));
