
-- Step 1: Drop the problematic recursive policies
DROP POLICY "Channel members can be viewed by other members." ON public.channel_members;
DROP POLICY "Channel admins can manage members." ON public.channel_members;

-- Step 2: Create helper functions with SECURITY DEFINER to bypass RLS and prevent recursion.
-- This function checks if a user is a member of a given channel.
CREATE OR REPLACE FUNCTION public.is_channel_member(p_channel_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
-- IMPORTANT: Set a secure search path to prevent hijacking
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE channel_id = p_channel_id AND user_id = p_user_id
  );
$$;

-- This function checks if a user is an admin of a given channel.
CREATE OR REPLACE FUNCTION public.is_channel_admin(p_channel_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE channel_id = p_channel_id AND user_id = p_user_id AND role = 'admin'::public.channel_role
  );
$$;

-- Step 3: Re-create the policies using the helper functions.
-- A user can see member records for any channel they are a part of.
CREATE POLICY "Channel members can be viewed by other members."
  ON public.channel_members FOR SELECT
  USING ( public.is_channel_member(channel_id, auth.uid()) );

-- An admin can perform any action on member records for channels they are an admin of.
-- This covers update and delete for admins.
-- The existing policies for users leaving channels and joining public channels remain unaffected.
CREATE POLICY "Admins can manage channel members."
  ON public.channel_members FOR ALL
  USING ( public.is_channel_admin(channel_id, auth.uid()) )
  WITH CHECK ( public.is_channel_admin(channel_id, auth.uid()) );

