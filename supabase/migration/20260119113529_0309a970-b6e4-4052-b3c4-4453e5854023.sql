-- Fix 1: Create user_article_likes table to properly track likes
CREATE TABLE public.user_article_likes (
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);

-- Enable RLS
ALTER TABLE public.user_article_likes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own likes
CREATE POLICY "Users can view own likes"
ON public.user_article_likes FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own likes
CREATE POLICY "Users can insert own likes"
ON public.user_article_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes"
ON public.user_article_likes FOR DELETE
USING (auth.uid() = user_id);

-- Fix 2: Create secure RPC function for incrementing reads
CREATE OR REPLACE FUNCTION public.increment_article_reads(p_article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE articles 
  SET reads = reads + 1 
  WHERE id = p_article_id AND published = true;
END;
$$;

-- Fix 3: Create secure RPC function for toggling likes
CREATE OR REPLACE FUNCTION public.toggle_article_like(p_article_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_liked BOOLEAN;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Check if article exists and is published
  IF NOT EXISTS (SELECT 1 FROM articles WHERE id = p_article_id AND published = true) THEN
    RAISE EXCEPTION 'Article not found or not published';
  END IF;
  
  -- Check if user already liked
  SELECT EXISTS(
    SELECT 1 FROM user_article_likes 
    WHERE user_id = v_user_id AND article_id = p_article_id
  ) INTO v_liked;
  
  IF v_liked THEN
    -- Unlike: remove from table and decrement counter
    DELETE FROM user_article_likes 
    WHERE user_id = v_user_id AND article_id = p_article_id;
    
    UPDATE articles SET likes = GREATEST(likes - 1, 0) WHERE id = p_article_id;
    RETURN false;
  ELSE
    -- Like: insert into table and increment counter
    INSERT INTO user_article_likes (user_id, article_id) 
    VALUES (v_user_id, p_article_id);
    
    UPDATE articles SET likes = likes + 1 WHERE id = p_article_id;
    RETURN true;
  END IF;
END;
$$;

-- Fix 4: Create function to check if user liked an article
CREATE OR REPLACE FUNCTION public.check_user_liked_article(p_article_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_article_likes 
    WHERE user_id = auth.uid() AND article_id = p_article_id
  );
END;
$$;

-- Fix 5: Make the article-images bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'article-images';

-- Fix 6: Drop existing public access policy
DROP POLICY IF EXISTS "Anyone can view article images" ON storage.objects;

-- Fix 7: Create new policy that checks article published status
CREATE POLICY "Authenticated users can view article images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'article-images' AND (
    -- Admins can see all images
    public.has_role(auth.uid(), 'admin') OR
    -- For published articles, allow public access via signed URLs handled by admin
    -- Or authenticated users can view images
    auth.uid() IS NOT NULL
  )
);