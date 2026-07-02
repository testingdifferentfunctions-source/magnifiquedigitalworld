
-- 1) article_translations: only show translations for published articles (or admins)
DROP POLICY IF EXISTS "Translations are viewable by everyone" ON public.article_translations;
CREATE POLICY "Translations for published articles are viewable"
ON public.article_translations
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.id = article_translations.article_id
      AND (a.published = true OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

-- 2) user_roles: scope mutation policies to authenticated role only
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can assign roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Lock down internal SECURITY DEFINER helpers that should not be called via the API
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.increment_article_reads(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_article_unique_views(uuid) FROM anon, public;

-- Keep the public-facing RPCs callable (these are intentionally exposed)
GRANT EXECUTE ON FUNCTION public.track_article_view(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_article_impressions(uuid[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_article_like_anonymous(uuid, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_article_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_liked_article(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_article_unique_views(uuid) TO authenticated;
