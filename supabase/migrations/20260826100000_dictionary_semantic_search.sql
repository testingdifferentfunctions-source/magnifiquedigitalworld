-- 20260826100000_dictionary_semantic_search.sql
-- Enables pgvector extension, ensures embedding vector(384) on mode_entries / dictionary tables,
-- and creates/updates match_dictionary_entries and match_mode_entries functions for Dictionary mode.

-- 1. Ensure pgvector extension is available
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Ensure embedding vector(384) column exists on mode_entries
ALTER TABLE public.mode_entries
  ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Ensure HNSW index for cosine distance exists for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS mode_entries_embedding_hnsw_idx
  ON public.mode_entries
  USING hnsw (embedding vector_cosine_ops);

-- 4. Dedicated RPC Function: match_dictionary_entries
-- Searches specifically across Dictionary mode entries using vector cosine similarity
CREATE OR REPLACE FUNCTION public.match_dictionary_entries(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.05,
  match_count int DEFAULT 30
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
    m.external_url,
    m.likes,
    m.published,
    (1 - (m.embedding <=> query_embedding))::float AS similarity
  FROM public.mode_entries m
  WHERE m.type = 'dictionary'
    AND m.published = true
    AND m.embedding IS NOT NULL
    AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Update global match_mode_entries function to ensure 'dictionary' filter is fully handled
CREATE OR REPLACE FUNCTION public.match_mode_entries(
  query_embedding vector(384),
  filter_type text DEFAULT NULL,
  match_threshold float DEFAULT 0.05,
  match_count int DEFAULT 30
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

-- 6. Update global match_documents function to include dictionary entries
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.05,
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

-- 7. Grant execution permissions to anon, authenticated and service_role
GRANT EXECUTE ON FUNCTION public.match_dictionary_entries(vector(384), float, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.match_mode_entries(vector(384), text, float, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.match_documents(vector(384), float, int, text) TO anon, authenticated, service_role;
