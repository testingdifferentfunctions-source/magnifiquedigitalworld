CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view social links"
  ON public.social_links FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert social links"
  ON public.social_links FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update social links"
  ON public.social_links FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete social links"
  ON public.social_links FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_social_links_updated_at
  BEFORE UPDATE ON public.social_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.social_links (platform, url, sort_order) VALUES
  ('Email', 'mailto:magnifiquedigitalworld@gmail.com', 0),
  ('Instagram', 'https://www.instagram.com/mystiquelord123/', 1),
  ('Telegram', 'https://t.me/learn4prog', 2),
  ('X', 'https://x.com/MystiqueLord123?t=__URRtHuKaYBmDF1-PZsSA&s=09', 3),
  ('Bluesky', 'https://bsky.app/profile/magnifiquedigital.bsky.social', 4),
  ('Facebook', 'https://www.facebook.com/profile.php?id=61588121860664', 5),
  ('TikTok', 'https://www.tiktok.com/@mystiquelord123', 6),
  ('Website', 'https://3gvbu.weblium.site', 7);
