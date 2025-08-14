-- Analyze and fix overly complex location sharing policy with potential loopholes
-- Drop the complex policy that could have security gaps
DROP POLICY IF EXISTS "Strict location privacy for live activities" ON public.live_activities;

-- Create ultra-simple, bulletproof location privacy policy
-- Only 2 ways to see location data: own activities OR explicit permission
CREATE POLICY "Ultra-secure location privacy - explicit consent only"
ON public.live_activities
FOR SELECT
TO authenticated
USING (
  expires_at > now()
  AND (
    -- Users can ONLY see their own activities
    auth.uid() = user_id
    OR
    -- OR explicit permission has been granted (most secure option)
    EXISTS (
      SELECT 1 FROM public.location_sharing_permissions lsp
      WHERE lsp.grantor_id = live_activities.user_id 
      AND lsp.grantee_id = auth.uid()
      AND (lsp.expires_at IS NULL OR lsp.expires_at > now())
    )
  )
);

-- Remove the location_sharing_level column since we're using explicit permissions only
-- This eliminates the complex logic that could have loopholes
ALTER TABLE public.live_activities DROP COLUMN IF EXISTS location_sharing_level;

-- Add a function to make it easy for users to grant temporary location access
CREATE OR REPLACE FUNCTION public.grant_location_access(
  to_user_id uuid,
  duration_hours integer DEFAULT 24
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow users to grant access for their own location data
  INSERT INTO public.location_sharing_permissions (grantor_id, grantee_id, expires_at)
  VALUES (
    auth.uid(), 
    to_user_id, 
    now() + (duration_hours || ' hours')::interval
  )
  ON CONFLICT (grantor_id, grantee_id) 
  DO UPDATE SET 
    expires_at = now() + (duration_hours || ' hours')::interval,
    created_at = now();
END;
$$;

-- Add a function to revoke location access
CREATE OR REPLACE FUNCTION public.revoke_location_access(from_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.location_sharing_permissions
  WHERE grantor_id = auth.uid() AND grantee_id = from_user_id;
END;
$$;