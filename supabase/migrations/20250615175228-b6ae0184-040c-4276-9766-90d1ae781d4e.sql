
-- First, create the function to calculate compatibility based on shared interests.
CREATE OR REPLACE FUNCTION public.calculate_compatibility_score(user1_id uuid, user2_id uuid)
RETURNS real
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    interests1 text[];
    interests2 text[];
    common_interests_count integer;
    total_interests_count integer;
    union_interests text[];
BEGIN
    -- Get interests for both users
    SELECT interests INTO interests1 FROM public.profiles WHERE id = user1_id;
    SELECT interests INTO interests2 FROM public.profiles WHERE id = user2_id;

    -- Handle cases where interests might be null or empty
    IF interests1 IS NULL OR array_length(interests1, 1) IS NULL THEN
        interests1 := '{}';
    END IF;
    IF interests2 IS NULL OR array_length(interests2, 1) IS NULL THEN
        interests2 := '{}';
    END IF;

    -- Calculate common interests (intersection)
    SELECT count(*) INTO common_interests_count
    FROM (
        SELECT unnest(interests1)
        INTERSECT
        SELECT unnest(interests2)
    ) AS common;

    -- If there are no common interests, score is 0
    IF common_interests_count = 0 THEN
        RETURN 0;
    END IF;

    -- Calculate total unique interests (union)
    SELECT array_agg(DISTINCT interest) INTO union_interests
    FROM (
        SELECT unnest(interests1)
        UNION ALL
        SELECT unnest(interests2)
    ) AS all_interests(interest);

    total_interests_count := array_length(union_interests, 1);

    -- Avoid division by zero
    IF total_interests_count = 0 THEN
        RETURN 0;
    END IF;

    -- Calculate Jaccard index as compatibility score
    RETURN common_interests_count::real / total_interests_count::real;
END;
$$;


-- Now, update the get_matches function to use the new compatibility score function.
DROP FUNCTION IF EXISTS public.get_matches();

CREATE OR REPLACE FUNCTION public.get_matches()
RETURNS TABLE(
    profile_id uuid,
    compatibility_score real
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  -- Find users who the current user follows, and who also follow them back (matches).
  -- For each match, calculate the compatibility score.
  SELECT
    f1.following_id AS profile_id,
    calculate_compatibility_score(auth.uid(), f1.following_id) AS compatibility_score
  FROM public.followers AS f1
  WHERE
    f1.follower_id = auth.uid() AND
    EXISTS (
      SELECT 1
      FROM public.followers AS f2
      WHERE f2.follower_id = f1.following_id AND f2.following_id = auth.uid()
    );
$$;
