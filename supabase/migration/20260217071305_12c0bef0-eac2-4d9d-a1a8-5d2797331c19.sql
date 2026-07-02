
-- Create category_translations table
CREATE TABLE public.category_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, language)
);

-- Enable RLS
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Category translations are viewable by everyone"
ON public.category_translations FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admins can insert category translations"
ON public.category_translations FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update category translations"
ON public.category_translations FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete category translations"
ON public.category_translations FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_category_translations_updated_at
BEFORE UPDATE ON public.category_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
