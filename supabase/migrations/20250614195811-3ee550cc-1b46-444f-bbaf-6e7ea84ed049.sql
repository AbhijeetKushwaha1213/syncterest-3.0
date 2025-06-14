
-- Create a table to store follower relationships
CREATE TABLE public.followers (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Add indexes for faster queries
CREATE INDEX followers_follower_id_idx ON public.followers(follower_id);
CREATE INDEX followers_following_id_idx ON public.followers(following_id);

-- Enable Row Level Security
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Policies for the 'followers' table

-- 1. Allow authenticated users to view all follower relationships.
-- This is needed to calculate follower/following counts for any profile.
CREATE POLICY "Allow authenticated read access"
ON public.followers
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow users to follow other users.
-- A user can only insert a row where they are the follower.
CREATE POLICY "Allow user to follow"
ON public.followers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

-- 3. Allow users to unfollow other users.
-- A user can only delete a row where they were the follower.
CREATE POLICY "Allow user to unfollow"
ON public.followers
FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);
