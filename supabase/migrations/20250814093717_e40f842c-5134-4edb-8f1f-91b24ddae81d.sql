-- Add enhanced location privacy controls to live_activities table
-- Add a new column to control location sharing visibility
ALTER TABLE public.live_activities 
ADD COLUMN IF NOT EXISTS location_sharing_level text DEFAULT 'friends' 
CHECK (location_sharing_level IN ('private', 'friends', 'followers', 'public'));

-- Add a new table for explicit location sharing permissions between users
CREATE TABLE IF NOT EXISTS public.location_sharing_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  grantor_id uuid NOT NULL, -- User who grants permission
  grantee_id uuid NOT NULL, -- User who receives permission
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone, -- Optional expiry for temporary sharing
  UNIQUE(grantor_id, grantee_id)
);

-- Enable RLS on the new table
ALTER TABLE public.location_sharing_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for location sharing permissions
CREATE POLICY "Users can manage their own location sharing permissions"
ON public.location_sharing_permissions
FOR ALL
TO authenticated
USING (auth.uid() = grantor_id)
WITH CHECK (auth.uid() = grantor_id);

CREATE POLICY "Users can view permissions granted to them"
ON public.location_sharing_permissions
FOR SELECT
TO authenticated
USING (auth.uid() = grantee_id);

-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Users can view live activities from followed users and themselves" ON public.live_activities;

-- Create new ultra-strict location privacy policy
CREATE POLICY "Strict location privacy for live activities"
ON public.live_activities
FOR SELECT
TO authenticated
USING (
  expires_at > now()
  AND (
    -- Users can always see their own activities
    auth.uid() = user_id
    OR
    -- Private: Only the user can see (already covered above)
    (location_sharing_level = 'private' AND false)
    OR
    -- Friends: Only mutual followers (friends) can see
    (location_sharing_level = 'friends' AND are_users_friends(auth.uid(), user_id))
    OR
    -- Followers: Users who follow this person can see (more restrictive than before)
    (location_sharing_level = 'followers' AND EXISTS (
      SELECT 1 FROM public.followers
      WHERE follower_id = auth.uid() AND following_id = live_activities.user_id
    ))
    OR
    -- Explicit permission: User has explicitly granted location access
    (EXISTS (
      SELECT 1 FROM public.location_sharing_permissions lsp
      WHERE lsp.grantor_id = live_activities.user_id 
      AND lsp.grantee_id = auth.uid()
      AND (lsp.expires_at IS NULL OR lsp.expires_at > now())
    ))
    OR
    -- Public: Only if explicitly set to public AND user has public profile
    (location_sharing_level = 'public' AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = live_activities.user_id 
      AND profile_visibility = 'public'
      AND location_sharing_enabled = true
    ))
  )
);