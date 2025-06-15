
-- Create a bucket for post images with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Create a bucket for reel videos with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('reels', 'reels', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the 'posts' bucket
CREATE POLICY "Allow authenticated insert on posts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'posts');

-- Allow anyone to view images in the 'posts' bucket
CREATE POLICY "Allow public select on posts"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Allow authenticated users to upload to the 'reels' bucket
CREATE POLICY "Allow authenticated insert on reels"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'reels');

-- Allow anyone to view videos in the 'reels' bucket
CREATE POLICY "Allow public select on reels"
ON storage.objects FOR SELECT
USING (bucket_id = 'reels');
