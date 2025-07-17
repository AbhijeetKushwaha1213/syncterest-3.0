
-- Create comments table for posts, events, and reels
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  reel_id uuid REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Ensure each comment is associated with exactly one content type
  CONSTRAINT comments_single_reference CHECK (
    (post_id IS NOT NULL AND event_id IS NULL AND reel_id IS NULL) OR
    (post_id IS NULL AND event_id IS NOT NULL AND reel_id IS NULL) OR
    (post_id IS NULL AND event_id IS NULL AND reel_id IS NOT NULL)
  )
);

-- Add an index for faster queries on content items
CREATE INDEX comments_post_id_idx ON public.comments(post_id);
CREATE INDEX comments_event_id_idx ON public.comments(event_id);
CREATE INDEX comments_reel_id_idx ON public.comments(reel_id);
CREATE INDEX comments_user_id_idx ON public.comments(user_id);

-- Enable Row Level Security on the comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments

-- 1. Allow authenticated users to view comments on content they can see
CREATE POLICY "Allow users to view comments on accessible content"
ON public.comments
FOR SELECT
TO authenticated
USING (
  -- Check if user can access the post/event/reel this comment belongs to
  (post_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.posts p 
    JOIN public.profiles pr ON p.user_id = pr.id 
    WHERE p.id = comments.post_id 
    AND (pr.profile_visibility = 'public' OR pr.id = auth.uid())
  )) OR
  (event_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = comments.event_id
  )) OR
  (reel_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.reels r 
    JOIN public.profiles pr ON r.user_id = pr.id 
    WHERE r.id = comments.reel_id 
    AND (pr.profile_visibility = 'public' OR pr.id = auth.uid())
  ))
);

-- 2. Allow users to create comments
CREATE POLICY "Allow users to create comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to update their own comments
CREATE POLICY "Allow users to update their own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to delete their own comments
CREATE POLICY "Allow users to delete their own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
