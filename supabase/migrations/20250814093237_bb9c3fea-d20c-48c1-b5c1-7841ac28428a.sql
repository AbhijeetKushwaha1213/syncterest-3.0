-- Fix critical security vulnerability in profiles table RLS policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles." ON public.profiles;

-- Create security definer function to check if users are mutual followers (friends)
CREATE OR REPLACE FUNCTION public.are_users_friends(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.followers f1
    WHERE f1.follower_id = user1_id AND f1.following_id = user2_id
  ) AND EXISTS (
    SELECT 1 FROM public.followers f2  
    WHERE f2.follower_id = user2_id AND f2.following_id = user1_id
  );
$$;

-- Create new secure RLS policy for profile access
CREATE POLICY "Secure profile access based on privacy settings"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own profile
  auth.uid() = id
  OR
  -- Users can see public profiles
  profile_visibility = 'public'
  OR
  -- Users can see friends-only profiles if they are mutual followers
  (profile_visibility = 'friends_only' AND public.are_users_friends(auth.uid(), id))
  -- Note: private profiles are never visible to others (only the owner via auth.uid() = id)
);