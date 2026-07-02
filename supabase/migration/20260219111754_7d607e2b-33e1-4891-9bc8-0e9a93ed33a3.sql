
-- Add impressions column to articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS impressions integer NOT NULL DEFAULT 0;

-- Create article_views table for unique view tracking
CREATE TABLE public.article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  viewer_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint for one view per viewer per article
CREATE UNIQUE INDEX idx_article_views_unique ON public.article_views(article_id, viewer_id);

ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (via RPC, not direct)
CREATE POLICY "Anyone can insert views" ON public.article_views FOR INSERT WITH CHECK (true);

-- Admins can read views for stats
CREATE POLICY "Admins can read views" ON public.article_views FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RPC to track article view (replaces old increment_article_reads)
CREATE OR REPLACE FUNCTION public.track_article_view(p_article_id uuid, p_viewer_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Increment total reads
  UPDATE articles SET reads = reads + 1 WHERE id = p_article_id AND published = true;
  
  -- Insert unique view (ignore duplicate)
  INSERT INTO article_views (article_id, viewer_id)
  VALUES (p_article_id, p_viewer_id)
  ON CONFLICT (article_id, viewer_id) DO NOTHING;
END;
$$;

-- RPC to increment impressions for multiple articles at once
CREATE OR REPLACE FUNCTION public.increment_article_impressions(p_article_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE articles SET impressions = impressions + 1 WHERE id = ANY(p_article_ids) AND published = true;
END;
$$;

-- RPC for anonymous like toggle (no user tracking)
CREATE OR REPLACE FUNCTION public.toggle_article_like_anonymous(p_article_id uuid, p_is_liking boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM articles WHERE id = p_article_id AND published = true) THEN
    RAISE EXCEPTION 'Article not found';
  END IF;
  
  IF p_is_liking THEN
    UPDATE articles SET likes = likes + 1 WHERE id = p_article_id;
  ELSE
    UPDATE articles SET likes = GREATEST(likes - 1, 0) WHERE id = p_article_id;
  END IF;
END;
$$;

-- RPC to get article stats (unique views count)
CREATE OR REPLACE FUNCTION public.get_article_unique_views(p_article_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count bigint;
BEGIN
  SELECT count(*) INTO v_count FROM article_views WHERE article_id = p_article_id;
  RETURN v_count;
END;
$$;
