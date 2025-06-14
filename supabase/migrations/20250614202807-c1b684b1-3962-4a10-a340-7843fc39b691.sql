
-- Create a table for user posts
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add an index for faster queries on user_id
CREATE INDEX posts_user_id_idx ON public.posts(user_id);

-- Enable Row Level Security on the posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- 1. Allow any authenticated user to view all posts.
CREATE POLICY "Allow authenticated read access"
ON public.posts
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow users to create their own posts.
CREATE POLICY "Allow user to create posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to update their own posts.
CREATE POLICY "Allow user to update posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to delete their own posts.
CREATE POLICY "Allow user to delete posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
