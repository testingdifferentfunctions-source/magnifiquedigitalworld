-- 20260824121500_semantic_search_vector_setup.sql
-- Enables pgvector extension, adds embedding columns (vector(384)),
-- and provisions match_documents, match_articles, and match_mode_entries similarity search functions.

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to articles table
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Ensure mode_entries table exists and add embedding column
CREATE TABLE IF NOT EXISTS public.mode_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  canonical_url_uk TEXT,
  canonical_url_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mode_entries
  ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 4. Enable RLS on mode_entries if not enabled
ALTER TABLE public.mode_entries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mode_entries' AND policyname = 'Anyone can view published mode entries'
  ) THEN
    CREATE POLICY "Anyone can view published mode entries"
      ON public.mode_entries FOR SELECT
      TO anon, authenticated
      USING (published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'mode_entries' AND policyname = 'Admins can manage all mode entries'
  ) THEN
    CREATE POLICY "Admins can manage all mode entries"
      ON public.mode_entries FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

GRANT SELECT ON public.mode_entries TO anon, authenticated;
GRANT ALL ON public.mode_entries TO service_role;

-- 5. Create HNSW indexes for fast cosine similarity vector searches
CREATE INDEX IF NOT EXISTS articles_embedding_hnsw_idx
  ON public.articles
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS mode_entries_embedding_hnsw_idx
  ON public.mode_entries
  USING hnsw (embedding vector_cosine_ops);

-- 6. RPC Function: match_articles
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
  content_uk TEXT,
  content_en TEXT,
  image_url TEXT,
  category_id UUID,
  tags TEXT[],
  reads INTEGER,
  likes INTEGER,
  published BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.title_uk,
    a.title_en,
    a.description,
    a.description_uk,
    a.description_en,
    a.content,
    a.content_uk,
    a.content_en,
    a.image_url,
    a.category_id,
    a.tags,
    a.reads,
    a.likes,
    a.published,
    a.created_at,
    a.updated_at,
    (1 - (a.embedding <=> query_embedding))::float AS similarity
  FROM public.articles a
  WHERE a.published = true
    AND a.embedding IS NOT NULL
    AND (1 - (a.embedding <=> query_embedding)) > match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. RPC Function: match_mode_entries
CREATE OR REPLACE FUNCTION public.match_mode_entries(
  query_embedding vector(384),
  filter_type text DEFAULT NULL,
  match_threshold float DEFAULT 0.1,
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
  image_source_url TEXT,
  external_url TEXT,
  category_id UUID,
  likes INTEGER,
  share_count INTEGER,
  published BOOLEAN,
  sort_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.type,
    m.slug,
    m.title_uk,
    m.title_en,
    m.description_uk,
    m.description_en,
    m.blocks_uk,
    m.blocks_en,
    m.tags,
    m.image_url,
    m.image_source_url,
    m.external_url,
    m.category_id,
    m.likes,
    m.share_count,
    m.published,
    m.sort_order,
    m.created_at,
    m.updated_at,
    (1 - (m.embedding <=> query_embedding))::float AS similarity
  FROM public.mode_entries m
  WHERE m.published = true
    AND (filter_type IS NULL OR m.type = filter_type)
    AND m.embedding IS NOT NULL
    AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 8. RPC Function: Global match_documents
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.1,
  match_count int DEFAULT 30,
  filter_mode text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content_type TEXT,
  title TEXT,
  description TEXT,
  image_url TEXT,
  category_id UUID,
  tags TEXT[],
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  WITH article_matches AS (
    SELECT
      a.id,
      'articles'::text AS content_type,
      COALESCE(a.title_uk, a.title) AS title,
      COALESCE(a.description_uk, a.description) AS description,
      a.image_url,
      a.category_id,
      a.tags,
      (1 - (a.embedding <=> query_embedding))::float AS similarity
    FROM public.articles a
    WHERE a.published = true
      AND a.embedding IS NOT NULL
      AND (filter_mode IS NULL OR filter_mode = 'articles')
      AND (1 - (a.embedding <=> query_embedding)) > match_threshold
  ),
  mode_entry_matches AS (
    SELECT
      m.id,
      m.type AS content_type,
      m.title_uk AS title,
      m.description_uk AS description,
      m.image_url,
      m.category_id,
      m.tags,
      (1 - (m.embedding <=> query_embedding))::float AS similarity
    FROM public.mode_entries m
    WHERE m.published = true
      AND m.embedding IS NOT NULL
      AND (filter_mode IS NULL OR filter_mode = m.type)
      AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  )
  SELECT * FROM (
    SELECT * FROM article_matches
    UNION ALL
    SELECT * FROM mode_entry_matches
  ) combined
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 9. Grant execute permissions to API roles
GRANT EXECUTE ON FUNCTION public.match_articles(vector(384), float, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.match_mode_entries(vector(384), text, float, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.match_documents(vector(384), float, int, text) TO anon, authenticated, service_role;
