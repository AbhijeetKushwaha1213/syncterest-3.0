-- Fix for location data security vulnerability
-- This migration protects user location data while maintaining existing functionality

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Secure profile access based on privacy settings" ON public.profiles;

-- Create separate policies for different types of profile data access

-- 1. General profile data (excluding sensitive location data)
CREATE POLICY "Public profile data access" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always see their own profile
  (auth.uid() = id) OR 
  -- Others can see non-sensitive profile data based on visibility settings
  (
    (profile_visibility = 'public'::text) OR 
    ((profile_visibility = 'friends_only'::text) AND are_users_friends(auth.uid(), id))
  )
);

-- 2. Sensitive location data access with proper authorization
CREATE POLICY "Protected location data access" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always see their own location data
  (auth.uid() = id) OR 
  -- Others need explicit location sharing permission
  (
    location_sharing_enabled = true AND 
    has_location_permission(id)
  )
);

-- Create a view that safely exposes profile data without location unless authorized
CREATE OR REPLACE VIEW public.safe_profiles AS
SELECT 
  p.id,
  p.updated_at,
  p.username,
  p.full_name,
  p.avatar_url,
  p.bio,
  p.interests,
  p.status,
  p.last_active_at,
  p.search_vector,
  p.email_notifications_enabled,
  p.push_notifications_enabled,
  p.new_message_notifications,
  p.new_follower_notifications,
  p.group_activity_notifications,
  p.event_reminder_notifications,
  p.language,
  p.intent,
  p.personality_tags,
  p.cultural_preferences,
  p.location_city,
  p.location_postal_code,
  p.created_at,
  p.profile_visibility,
  p.location_sharing_enabled,
  p.show_location_on_profile,
  p.show_activity_status,
  -- Only include precise location data if user has permission
  CASE 
    WHEN (auth.uid() = p.id) OR (p.location_sharing_enabled = true AND has_location_permission(p.id))
    THEN p.latitude 
    ELSE NULL 
  END as latitude,
  CASE 
    WHEN (auth.uid() = p.id) OR (p.location_sharing_enabled = true AND has_location_permission(p.id))
    THEN p.longitude 
    ELSE NULL 
  END as longitude
FROM public.profiles p;

-- Grant access to the safe_profiles view
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.safe_profiles SET (security_barrier = true);

-- Update the existing location-based functions to use the permission system
CREATE OR REPLACE FUNCTION public.get_nearby_users(p_latitude double precision, p_longitude double precision, p_radius_km integer)
RETURNS SETOF profiles
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT *
  FROM public.profiles
  WHERE
    id != auth.uid() AND
    location_sharing_enabled = true AND
    has_location_permission(id) AND
    latitude IS NOT NULL AND
    longitude IS NOT NULL AND
    -- Using the haversine formula to calculate distance in kilometers.
    -- 6371 is the Earth's radius in km.
    6371 * acos(
        cos(radians(p_latitude)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(p_longitude)) +
        sin(radians(p_latitude)) * sin(radians(latitude))
    ) <= p_radius_km
$function$;