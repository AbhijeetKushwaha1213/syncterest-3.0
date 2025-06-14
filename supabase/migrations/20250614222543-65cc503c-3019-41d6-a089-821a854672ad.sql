
CREATE OR REPLACE FUNCTION public.get_matches()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Find users who the current user follows, and who also follow the current user back.
  SELECT f1.following_id
  FROM public.followers AS f1
  WHERE
    f1.follower_id = auth.uid() AND
    EXISTS (
      SELECT 1
      FROM public.followers AS f2
      WHERE f2.follower_id = f1.following_id AND f2.following_id = auth.uid()
    );
$$;
