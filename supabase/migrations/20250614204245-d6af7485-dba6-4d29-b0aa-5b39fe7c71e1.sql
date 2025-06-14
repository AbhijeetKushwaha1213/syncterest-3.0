
-- Create a table to store stories
CREATE TABLE public.stories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hour')
);

-- Enable Row Level Security for the stories table
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own stories
CREATE POLICY "Users can insert their own stories"
ON public.stories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view active stories
CREATE POLICY "Authenticated users can view non-expired stories"
ON public.stories
FOR SELECT
USING (auth.role() = 'authenticated' AND expires_at > now());

-- Allow users to delete their own stories
CREATE POLICY "Users can delete their own stories"
ON public.stories
FOR DELETE
USING (auth.uid() = user_id);

-- Create a storage bucket for story images
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true);

-- Allow authenticated users to upload images to their own folder in the stories bucket
CREATE POLICY "Authenticated users can upload stories"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'stories' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Allow anyone to view images in the stories bucket
CREATE POLICY "Anyone can view stories"
ON storage.objects FOR SELECT
USING ( bucket_id = 'stories' );

-- Enable realtime on stories table
ALTER TABLE public.stories REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
