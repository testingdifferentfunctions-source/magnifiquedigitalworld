
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS share_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_article_shares(p_article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE articles SET share_count = share_count + 1 WHERE id = p_article_id AND published = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_article_shares(uuid) TO anon, authenticated;
