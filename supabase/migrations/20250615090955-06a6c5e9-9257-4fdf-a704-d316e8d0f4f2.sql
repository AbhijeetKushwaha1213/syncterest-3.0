
-- Create a table for user reels
CREATE TABLE public.reels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add an index for faster queries on user_id
CREATE INDEX reels_user_id_idx ON public.reels(user_id);

-- Enable Row Level Security on the reels table
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- 1. Allow any authenticated user to view all reels.
CREATE POLICY "Allow authenticated read access for reels"
ON public.reels
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow users to create their own reels.
CREATE POLICY "Allow user to create reels"
ON public.reels
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to update their own reels.
CREATE POLICY "Allow user to update their own reels"
ON public.reels
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to delete their own reels.
CREATE POLICY "Allow user to delete their own reels"
ON public.reels
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

