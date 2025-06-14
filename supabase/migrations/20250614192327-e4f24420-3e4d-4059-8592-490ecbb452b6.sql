
-- 1. Create a function to securely get conversation IDs for the current user.
-- This function runs with elevated privileges to avoid the recursion issue.
CREATE OR REPLACE FUNCTION public.get_my_conversation_ids()
RETURNS SETOF uuid AS $$
BEGIN
  -- This query can now safely access conversation_participants without triggering RLS loops.
  RETURN QUERY SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Drop the old policies that were causing the infinite recursion.
DROP POLICY IF EXISTS "Users can view conversations they are part of" ON public.conversations;
DROP POLICY IF EXISTS "Users can view participants of conversations they are in" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert participants into conversations they are in" ON public.conversation_participants;

-- 3. Recreate the policies using the new, safe function.
CREATE POLICY "Users can view conversations they are part of"
  ON public.conversations FOR SELECT
  USING (id IN (SELECT get_my_conversation_ids()));

CREATE POLICY "Users can view participants of conversations they are in"
  ON public.conversation_participants FOR SELECT
  USING (conversation_id IN (SELECT get_my_conversation_ids()));

CREATE POLICY "Users can insert participants into conversations they are in"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (conversation_id IN (SELECT get_my_conversation_ids()));
