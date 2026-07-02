
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  reads INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app_role enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Categories policies: everyone can read, admins can modify
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert categories" 
ON public.categories FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories" 
ON public.categories FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories" 
ON public.categories FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Articles policies: everyone can read published, admins can modify all
CREATE POLICY "Published articles are viewable by everyone" 
ON public.articles FOR SELECT 
USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert articles" 
ON public.articles FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update articles" 
ON public.articles FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete articles" 
ON public.articles FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, image_url) VALUES
('Основи Python', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=200&h=200&fit=crop'),
('Веб-розробка', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=200&h=200&fit=crop'),
('Бази даних', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=200&h=200&fit=crop'),
('Алгоритми', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&h=200&fit=crop'),
('Машинне навчання', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=200&h=200&fit=crop');

-- Insert sample articles
INSERT INTO public.articles (title, description, content, image_url, category_id, reads, likes, published) VALUES
('Вступ до Python', 'Основи мови програмування Python для початківців', 'Вітаємо у світі Python!', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop', (SELECT id FROM public.categories WHERE name = 'Основи Python'), 1250, 89, true),
('Змінні та типи даних', 'Детальний огляд типів даних у Python', 'У Python є багато типів даних...', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop', (SELECT id FROM public.categories WHERE name = 'Основи Python'), 980, 72, true),
('Django для початківців', 'Створення веб-додатків з Django', 'Django - це потужний веб-фреймворк...', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop', (SELECT id FROM public.categories WHERE name = 'Веб-розробка'), 856, 65, true),
('PostgreSQL та Python', 'Робота з базами даних PostgreSQL', 'PostgreSQL - це надійна база даних...', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop', (SELECT id FROM public.categories WHERE name = 'Бази даних'), 645, 48, true),
('Алгоритми сортування', 'Огляд популярних алгоритмів сортування', 'Сортування - основа багатьох алгоритмів...', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop', (SELECT id FROM public.categories WHERE name = 'Алгоритми'), 520, 41, true);
