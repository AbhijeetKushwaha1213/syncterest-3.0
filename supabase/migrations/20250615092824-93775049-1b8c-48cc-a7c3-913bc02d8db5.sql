
-- Create a bucket for avatars with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to the 'avatars' bucket into their own folder
CREATE POLICY "Allow authenticated insert on avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Allow authenticated update on own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Allow authenticated delete on own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow anyone to view images in the 'avatars' bucket
CREATE POLICY "Allow public select on avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
