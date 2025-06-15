
-- Create a bucket for event images with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies to manage access to the 'event-images' bucket
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated insert on event-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- Allow anyone to view images in the 'event-images' bucket
CREATE POLICY "Allow public select on event-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Allow users to update their own event images (assuming a path like `user_id/image.png`)
CREATE POLICY "Allow user to update own event images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own event images
CREATE POLICY "Allow user to delete own event images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);
