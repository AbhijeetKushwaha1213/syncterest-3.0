
-- Drop the old policy that only allows creators to update
DROP POLICY "Channel creators can update their channels." ON public.channels;

-- Create a new policy that allows any channel admin to update
CREATE POLICY "Admins can update channel details."
  ON public.channels FOR UPDATE
  USING ( public.is_channel_admin(id, auth.uid()) );
