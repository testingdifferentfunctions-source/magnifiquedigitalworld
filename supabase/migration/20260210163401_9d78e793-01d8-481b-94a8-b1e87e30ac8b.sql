-- Make the article-images bucket public
UPDATE storage.buckets SET public = true WHERE id = 'article-images';

-- Replace auth-required SELECT policy with public access
DROP POLICY IF EXISTS "Authenticated users can view article images" ON storage.objects;

CREATE POLICY "Anyone can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');