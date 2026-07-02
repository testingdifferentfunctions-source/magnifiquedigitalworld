ALTER TABLE public.user_article_likes 
ADD CONSTRAINT user_article_likes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;