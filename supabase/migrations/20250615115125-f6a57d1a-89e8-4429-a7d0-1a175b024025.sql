
-- Phase 5: Integrate Privacy Settings into Advanced Search (Correction)

-- Step 1: Correct the advanced search function to use the correct column names for privacy settings.
-- This modification fixes a typo from the previous migration ('show_location' -> 'location_sharing_enabled')
-- and ensures that:
-- 1. Only profiles marked as 'public' are included in search results.
-- 2. Distance filtering and sorting only apply to users who have enabled location sharing for discovery.
-- 3. 'Recently Active' sort option respects the 'show_activity_status' privacy setting.
CREATE OR REPLACE FUNCTION advanced_search_users(
    p_search_term text,
    p_intent text,
    p_personality_tags text[],
    p_latitude double precision,
    p_longitude double precision,
    p_radius_km integer,
    p_sort_by text
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    where_clause TEXT;
    query TEXT;
BEGIN
    -- Construct the WHERE clause with privacy checks
    where_clause := '
        WHERE
            p.id != auth.uid()
            AND p.profile_visibility = ''public'' -- Only show public profiles
            AND (' || quote_nullable(p_search_term) || ' IS NULL OR ' || quote_nullable(p_search_term) || ' = '''' OR p.search_vector @@ websearch_to_tsquery(''english'', ' || quote_nullable(p_search_term) || '))
            AND (' || quote_nullable(p_intent) || ' IS NULL OR ' || quote_nullable(p_intent) || ' = ''all'' OR p.intent = ' || quote_nullable(p_intent) || ')
            AND (array_length(' || quote_nullable(p_personality_tags) || ', 1) IS NULL OR array_length(' || quote_nullable(p_personality_tags) || ', 1) = 0 OR p.personality_tags && ' || quote_nullable(p_personality_tags) || ')
            AND (
                -- Distance filter conditions now also check if location sharing is enabled
                ' || quote_nullable(p_latitude) || ' IS NULL OR ' || quote_nullable(p_longitude) || ' IS NULL OR ' || quote_nullable(p_radius_km) || ' IS NULL OR p.location_sharing_enabled IS NOT TRUE OR p.latitude IS NULL OR p.longitude IS NULL OR
                (6371 * acos(
                    cos(radians(' || p_latitude || ')) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(' || p_longitude || ')) +
                    sin(radians(' || p_latitude || ')) * sin(radians(p.latitude))
                )) <= ' || p_radius_km || '
            )
    ';

    -- Construct the full query based on the sort option
    IF p_sort_by = 'distance' THEN
        query := 'SELECT * FROM public.profiles p ' || where_clause || '
                  ORDER BY (CASE
                                -- Only calculate distance if location sharing is enabled
                                WHEN ' || quote_nullable(p_latitude) || ' IS NOT NULL AND ' || quote_nullable(p_longitude) || ' IS NOT NULL AND p.location_sharing_enabled IS TRUE AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
                                THEN (6371 * acos(
                                        cos(radians(' || p_latitude || ')) * cos(radians(p.latitude)) *
                                        cos(radians(p.longitude) - radians(' || p_longitude || ')) +
                                        sin(radians(' || p_latitude || ')) * sin(radians(p.latitude))
                                    ))
                                ELSE NULL
                            END) ASC NULLS LAST';
    ELSIF p_sort_by = 'recent' THEN
        query := 'SELECT * FROM public.profiles p ' || where_clause || ' ORDER BY (CASE WHEN p.show_activity_status THEN p.last_active_at ELSE NULL END) DESC NULLS LAST';
    ELSIF p_sort_by = 'new' THEN
        query := 'SELECT * FROM public.profiles p ' || where_clause || ' ORDER BY p.created_at DESC NULLS LAST';
    ELSE -- 'compatible' and other fallbacks
        query := 'SELECT * FROM public.profiles p ' || where_clause || ' ORDER BY ts_rank(p.search_vector, websearch_to_tsquery(''english'', ' || quote_nullable(p_search_term) || ')) DESC';
    END IF;

    RETURN QUERY EXECUTE query;
END;
$$;
