-- Fix critical security vulnerability in group_members table RLS policies
-- Drop the overly permissive policy that makes all group members public
DROP POLICY IF EXISTS "Group members are public." ON public.group_members;

-- Create security definer function to check if user is a member of a group
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = p_user_id
  );
$$;

-- Create new secure RLS policies for group_members
CREATE POLICY "Users can view group members of groups they belong to"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  -- Users can see their own memberships
  auth.uid() = user_id
  OR
  -- Users can see other members in groups they are also members of
  public.is_group_member(group_id, auth.uid())
);

-- Keep the existing policy for users to manage their own memberships
-- This was already secure: "Users can join and leave groups."