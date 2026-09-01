-- 1. Create analytics_events table for tracking 24h metrics (views, likes, shares) across all modes
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'view', 'like', 'share'
  mode TEXT NOT NULL DEFAULT 'articles', -- 'articles', 'news', 'resources', 'components', 'templates', 'research', 'palettes', 'design', 'dictionary'
  target_id TEXT NOT NULL,
  viewer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Indexes for fast aggregation in last 24h
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_type ON public.analytics_events (created_at DESC, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON public.analytics_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_target ON public.analytics_events (target_id, event_type);

-- 3. Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can log analytics events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Anyone can insert analytics events'
  ) THEN
    CREATE POLICY "Anyone can insert analytics events"
      ON public.analytics_events FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Admins and authenticated/anon users can select analytics for dashboards
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Anyone can view analytics events'
  ) THEN
    CREATE POLICY "Anyone can view analytics events"
      ON public.analytics_events FOR SELECT
      USING (true);
  END IF;
END $$;

GRANT ALL ON public.analytics_events TO anon, authenticated, service_role;

-- 4. RPC to log analytics events safely
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

GRANT EXECUTE ON FUNCTION public.log_analytics_event(TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated, service_role;

-- 5. RPC to get 24-hour summary analytics
CREATE OR REPLACE FUNCTION public.get_24h_analytics()
RETURNS TABLE (
  views_24h BIGINT,
  likes_24h BIGINT,
  shares_24h BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_views BIGINT := 0;
  v_likes BIGINT := 0;
  v_shares BIGINT := 0;
  v_legacy_views BIGINT := 0;
  v_legacy_likes BIGINT := 0;
BEGIN
  -- Count 24h views from analytics_events
  SELECT COUNT(*) INTO v_views
  FROM public.analytics_events
  WHERE event_type = 'view'
    AND created_at >= (NOW() - INTERVAL '24 HOURS');

  -- Also count from legacy article_views if table exists and has records
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'article_views') THEN
    SELECT COUNT(*) INTO v_legacy_views
    FROM public.article_views
    WHERE created_at >= (NOW() - INTERVAL '24 HOURS');
    
    v_views := v_views + COALESCE(v_legacy_views, 0);
  END IF;

  -- Count 24h likes from analytics_events
  SELECT COUNT(*) INTO v_likes
  FROM public.analytics_events
  WHERE event_type = 'like'
    AND created_at >= (NOW() - INTERVAL '24 HOURS');

  -- Also count from legacy user_article_likes if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_article_likes') THEN
    SELECT COUNT(*) INTO v_legacy_likes
    FROM public.user_article_likes
    WHERE created_at >= (NOW() - INTERVAL '24 HOURS');
    
    v_likes := v_likes + COALESCE(v_legacy_likes, 0);
  END IF;

  -- Count 24h shares from analytics_events
  SELECT COUNT(*) INTO v_shares
  FROM public.analytics_events
  WHERE event_type = 'share'
    AND created_at >= (NOW() - INTERVAL '24 HOURS');

  RETURN QUERY SELECT v_views, v_likes, v_shares;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_24h_analytics() TO anon, authenticated, service_role;

-- 6. RPC functions for mode entries shares & likes if not already present
CREATE OR REPLACE FUNCTION public.increment_mode_entry_shares(p_entry_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mode_entries') THEN
    UPDATE public.mode_entries
    SET share_count = COALESCE(share_count, 0) + 1
    WHERE id = p_entry_id;
  END IF;

  -- Record event in analytics_events
  INSERT INTO public.analytics_events (event_type, mode, target_id, created_at)
  VALUES ('share', 'mode_entry', p_entry_id::text, now());
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_mode_entry_shares(UUID) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.toggle_mode_entry_like(p_entry_id UUID, p_is_liking BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mode_entries') THEN
    IF p_is_liking THEN
      UPDATE public.mode_entries
      SET likes = COALESCE(likes, 0) + 1
      WHERE id = p_entry_id;
    ELSE
      UPDATE public.mode_entries
      SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
      WHERE id = p_entry_id;
    END IF;
  END IF;

  IF p_is_liking THEN
    INSERT INTO public.analytics_events (event_type, mode, target_id, created_at)
    VALUES ('like', 'mode_entry', p_entry_id::text, now());
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_mode_entry_like(UUID, BOOLEAN) TO anon, authenticated, service_role;
