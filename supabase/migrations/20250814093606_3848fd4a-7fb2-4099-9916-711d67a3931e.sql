-- Fix critical security vulnerability in live_activities table RLS policies
-- Drop the overly permissive policy that exposes all users' locations
DROP POLICY IF EXISTS "Users can view non-expired live activities" ON public.live_activities;

-- Create new secure RLS policy that respects user relationships and privacy
CREATE POLICY "Users can view live activities from followed users and themselves"
ON public.live_activities
FOR SELECT
TO authenticated
USING (
  expires_at > now()
  AND (
    -- Users can always see their own activities
    auth.uid() = user_id
    OR
    -- Users can see activities from users they follow
    EXISTS (
      SELECT 1 FROM public.followers
      WHERE follower_id = auth.uid() AND following_id = live_activities.user_id
    )
    OR
    -- Users can see activities from users with public profiles
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = live_activities.user_id 
      AND profile_visibility = 'public'
    )
  )
);