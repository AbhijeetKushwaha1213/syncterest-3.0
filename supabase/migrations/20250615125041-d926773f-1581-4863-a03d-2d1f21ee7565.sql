
-- Phase 6: User Discovery Features

-- Step 1: Create a function to get trending profiles.
-- "Trending" is defined as having the most followers. This will power
-- a "Trending People" section on the homepage.
CREATE OR REPLACE FUNCTION get_trending_profiles(limit_count integer)
RETURNS SETOF profiles
LANGUAGE sql STABLE
AS $$
  SELECT p.*
  FROM profiles p
  JOIN (
    SELECT
      following_id,
      COUNT(*) as followers_count
    FROM followers
    GROUP BY following_id
    ORDER BY followers_count DESC
    LIMIT limit_count
  ) AS top_followers ON p.id = top_followers.following_id
  WHERE p.id != auth.uid()
  ORDER BY top_followers.followers_count DESC;
$$;
