-- Create table for caching article translations
CREATE TABLE public.article_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, language)
);

-- Enable RLS
ALTER TABLE public.article_translations ENABLE ROW LEVEL SECURITY;

-- Everyone can read translations (same as articles)
CREATE POLICY "Translations are viewable by everyone"
ON public.article_translations FOR SELECT
USING (true);

-- Only admins can manage translations
CREATE POLICY "Admins can insert translations"
ON public.article_translations FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update translations"
ON public.article_translations FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete translations"
ON public.article_translations FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_article_translations_updated_at
BEFORE UPDATE ON public.article_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();